import { cleanCurrentUrl } from "./util";
import { makeChannel } from 'sync-message';
import { BackendManager, ProgrammingLanguage } from "./backend-manager";
import { Backend } from "./backend";
import { SyncClient } from "comsync";
import { proxy } from "comlink";
import { BackendEvent } from "./backend-event";

/**
 * Enum representing the possible states while processing code
 */
export enum RunState {
    Loading = "loading",
    Running = "running",
    AwaitingInput = "awaiting_input",
    Stopping = "stopping",
    Ready = "ready"
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
    status: "loading" | "loaded" | "failed";

}

interface CodeConfig {

}

export class CodeRunner {
  private config: CodeConfig;
  public backend: Promise<SyncClient<Backend>>;
  constructor(config: CodeConfig) {
    this.config = config;
    this.backend = Promise.resolve({} as SyncClient<Backend>)
  }

  public async init() {
    await this.configureInput();
  }

  public async start() {
    const tempBackend = BackendManager.getBackend(ProgrammingLanguage.Python);

    this.backend = new Promise(async resolve => {
      const workerProxy = tempBackend.workerProxy;
      await workerProxy
      // Allow passing messages between worker and main thread
        .launch(
          proxy((e: BackendEvent) => BackendManager.publish(e)),
          proxy(() => {
            console.log('OVERFLOW');
          })
        );
      resolve(tempBackend);
    });
  }

  public async runCode(code: string) {
    const backend = await this.backend;
    await backend.call(backend.workerProxy.runCode, code);
  }

  public async submitInput(text: string) {
    const backend = await this.backend;
    await backend.writeMessage(text);
  }

  private async configureInput(): Promise<boolean> {
    if (typeof SharedArrayBuffer === "undefined") {
      if (!("serviceWorker" in navigator)) {
        return false;
      }
      const serviceWorkerRoot = cleanCurrentUrl(true);
      const channelOptions = { serviceWorkerUrl: 'InputServiceWorker.js', scope: serviceWorkerRoot }
      const serviceWorkerUrl = serviceWorkerRoot + 'InputServiceWorker.js';
      try {
        await window.navigator.serviceWorker.register(serviceWorkerUrl);
        BackendManager.channel = makeChannel({ serviceWorker: channelOptions })!;
      } catch (error: any) {
        return false;
      }
    } else {
      BackendManager.channel = makeChannel({
        atomics: { }
      })!;
    }
    return true;
  }
}
