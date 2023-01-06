/* eslint-disable class-methods-use-this */
import { makeChannel } from 'sync-message';
import { SyncClient } from 'comsync';
import { proxy } from 'comlink';
import { CompletionSource } from '@codemirror/autocomplete';
import { LintSource } from '@codemirror/lint';
import { EditorView } from '@codemirror/view';

import { cleanCurrentUrl, parseData } from '../util/util';
import { BackendManager, ProgrammingLanguage } from './backend-manager';
import { Backend } from './backend';
import { BackendEvent, BackendEventType } from './backend-event';
import Logger from '../util/logger';
import InputServiceWorker from './InputServiceWorker?worker&url';

/**
 * Enum representing the possible states while processing code
 */
export enum RunState {
  Loading = 'loading',
  Running = 'running',
  AwaitingInput = 'awaiting_input',
  Stopping = 'stopping',
  Ready = 'ready',
}

/**
 * Interface to represent information required when handling loading events
 */
export interface LoadingData {
  /**
     * List of module names that are being loaded
     */
  modules: Array<string>;
  /**
     * The status of the import
     */
  status: 'loading' | 'loaded' | 'failed';

}

interface CodeConfig {

}

export class CodeRunner {
  private config: CodeConfig;

  private previousState: RunState;

  public state: RunState;

  public message: string = '';

  private backend: Promise<SyncClient<Backend>>;

  /**
     * Array of packages that are being installed
     */
  private loadingPackages: string[];

  private updateState: (newState: RunState) => void;

  private updateMessage: (newMessage: string) => void;

  private updateCodeRunner: () => void;

  private runStartTime: number = 0;

  public completionSource: CompletionSource | null = null;

  public lintSource: LintSource | null = null;

  constructor(
    config: CodeConfig,
    updateState: (newState: RunState) => void,
    updateMessage: (newMessage: string) => void,
    updateCodeRunner: () => void,
  ) {
    this.config = config;
    this.backend = Promise.resolve({} as SyncClient<Backend>);
    this.previousState = RunState.Ready;
    this.state = RunState.Ready;
    this.loadingPackages = [];
    this.updateState = updateState;
    this.updateMessage = updateMessage;
    this.updateCodeRunner = updateCodeRunner;

    BackendManager.subscribe(
      BackendEventType.Loading,
      (e) => this.onLoad(e),
    );
    BackendManager.subscribe(
      BackendEventType.Start,
      (e) => this.onStart(e),
    );
    BackendManager.subscribe(
      BackendEventType.Input,
      (e) => this.setState(RunState.AwaitingInput, `"${e.data}"`),
    );
  }

  public setState(value: RunState, message: string = '') {
    this.previousState = this.state;
    this.state = value;
    this.updateState(value);
    this.updateMessage(message);
    Logger.log('State set to', value);
  }

  public async init() {
    await this.configureInput();
  }

  public async start() {
    this.setState(RunState.Loading);
    const tempBackend = BackendManager.getBackend(ProgrammingLanguage.Python);

    this.backend = (async () => {
      const { workerProxy } = tempBackend;
      await workerProxy
      // Allow passing messages between worker and main thread
        .launch(
          proxy((e: BackendEvent) => BackendManager.publish(e)),
          proxy(() => {
            Logger.log('OVERFLOW');
          }),
        );
      this.completionSource = (async (context) => {
        const completionContext = Backend.convertCompletionContext(context);
        return workerProxy.autocomplete(completionContext);
      });
      this.lintSource = (
        async (view: EditorView) => {
          const workerDiagnostics = await workerProxy.lintCode(view.state.doc.toJSON().join('\n'));
          return workerDiagnostics.map((d) => {
            const fromline = view.state.doc.line(d.lineNr);
            const toLine = view.state.doc.line(d.endLineNr);
            const from = Math.min(fromline.from + d.columnNr, fromline.to);
            const to = Math.min(toLine.from + d.endColumnNr, toLine.to);
            return { ...d, from, to };
          });
        }
      );
      this.updateCodeRunner();
      return tempBackend;
    })();

    this.setState(RunState.Ready);
  }

  public async runCode(code: string) {
    let interrupted = false;
    let terminated = false;
    BackendManager.publish({
      type: BackendEventType.Start,
      data: 'StartClicked',
      contentType: 'text/plain',
    });
    this.setState(RunState.Loading);
    this.previousState = RunState.Loading;
    const backend = await this.backend;
    try {
      await backend.call(backend.workerProxy.runCode, code);
    } catch (error: any) {
      if (error.type === 'InterruptError') {
        // Error signaling forceful interrupt
        interrupted = true;
        terminated = true;
      } else {
        BackendManager.publish({
          type: BackendEventType.Error,
          data: JSON.stringify(error),
          contentType: 'text/json',
        });
        BackendManager.publish({
          type: BackendEventType.End,
          data: 'RunError',
          contentType: 'text/plain',
        });
      }
    } finally {
      if (this.state === RunState.Stopping) {
        // Was interrupted, End message already published
        interrupted = true;
      }
      this.setState(RunState.Ready, interrupted ? `Suoritus keskeytettiin ajassa ${(new Date().getTime() - this.runStartTime) / 1000}s` : `Suoritettiin ajassa ${(new Date().getTime() - this.runStartTime) / 1000}s`);
      if (terminated) {
        await this.start();
      } else if (await backend.workerProxy.hasOverflow()) {
        Logger.log('Meni yli');
        /* this.outputManager.onOverflow(async () => {
          const backend = await this.backend;
          const overflowResults = (await backend.workerProxy.getOverflow())
            .map((e) => e.data).join('');
          downloadResults(
            overflowResults,
            'overflow-results.txt',
          );
        }); */
      }
    }
  }

  public async submitInput(text: string) {
    const backend = await this.backend;
    await backend.writeMessage(text);
  }

  /**
     * Interrupt the currently running code
     * @return {Promise<void>} Promise of stopping
     */
  public async stopCode(): Promise<void> {
    this.setState(RunState.Stopping);
    BackendManager.publish({
      type: BackendEventType.End,
      data: 'User cancelled run',
      contentType: 'text/plain',
    });
    const backend = await this.backend;
    await backend.interrupt();
  }

  private async configureInput(): Promise<boolean> {
    if (typeof SharedArrayBuffer === 'undefined') {
      if (!('serviceWorker' in navigator)) {
        return false;
      }
      const serviceWorkerRoot = cleanCurrentUrl(true);
      const channelOptions = { serviceWorkerUrl: InputServiceWorker, scope: serviceWorkerRoot };
      const serviceWorkerUrl = InputServiceWorker;
      try {
        // @ts-ignore
        await navigator.serviceWorker.register(serviceWorkerUrl);
        BackendManager.channel = makeChannel({ serviceWorker: channelOptions })!;
      } catch (error: any) {
        return false;
      }
    } else {
      BackendManager.channel = makeChannel({
        atomics: { },
      })!;
    }
    return true;
  }

  /**
     * Callback to handle loading events
     * @param {BackendEvent} e The loading event
     */
  private onLoad(e: BackendEvent): void {
    const loadingData = parseData(e.data, e.contentType) as LoadingData;
    if (loadingData.status === 'loading') {
      loadingData.modules.forEach((m) => {
        if (!this.loadingPackages.includes(m)) {
          this.loadingPackages.push(m);
        }
      });
    } else if (loadingData.status === 'loaded') {
      loadingData.modules.forEach((m) => {
        const index = this.loadingPackages.indexOf(m);
        if (index !== -1) {
          this.loadingPackages.splice(index, 1);
        }
      });
    } else { // failed
      // If it is a true module, an Exception will be raised when running
      // So this does not need to be handled here, as it is often an incomplete package-name
      // that causes micropip to not find the correct wheel
      this.loadingPackages = [];
    }
    if (this.loadingPackages.length > 0) {
      /* const packageMessage = t('Papyros.loading', {
        // limit amount of package names shown
        packages: this.loadingPackages.slice(0, 3).join(', '),
      }); */
      Logger.log(`Loading ${this.loadingPackages.join(', ')}`);
      this.setState(RunState.Loading);
    } else {
      this.setState(this.previousState);
    }
  }

  private onStart(e: BackendEvent): void {
    const startData = parseData(e.data, e.contentType) as string;
    if (startData.includes('RunCode')) {
      this.runStartTime = new Date().getTime();
      this.setState(RunState.Running);
    }
  }
}
