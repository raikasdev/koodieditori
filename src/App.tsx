import React, { useEffect, useState } from 'react';
import {
  AppShell, Button, Header, MantineProvider, Navbar,
} from '@mantine/core';
import { CodeRunner, RunState } from './python/code-runner';
import { BackendManager } from './python/backend-manager';
import { BackendEventType } from './python/backend-event';
import useInit from './hooks/use-init';
import Logger from './util/logger';
import CodeEditor from './components/CodeEditor';
import Input from './components/Input';
import Output from './components/Output';

function App() {
  const [codeRunner, setCodeRunner] = useState<CodeRunner | null>(null);
  const [runState, setRunState] = useState(RunState.Loading);
  const [message, setMessage] = useState('');
  const [codeRunnerLoading, setCodeRunnerLoading] = useState(true);

  useInit(async () => {
    const codeRunnerInstance = new CodeRunner(
      {},
      (newState) => setRunState(newState),
      (newMessage) => setMessage(newMessage),
      () => setCodeRunnerLoading(!codeRunnerLoading),
    );
    await codeRunnerInstance.init();
    await codeRunnerInstance.start();
    setCodeRunner(codeRunnerInstance);

    BackendManager.subscribe(BackendEventType.Output, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.Input, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.Sleep, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.Loading, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.End, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.Interrupt, (e) => Logger.log(e));
    BackendManager.subscribe(BackendEventType.Start, (e) => Logger.log(e));
  });

  return (
    <MantineProvider withGlobalStyles withNormalizeCSS>
      <AppShell
        navbar={(
          <Navbar
            width={{ base: 450 }}
            styles={(theme) => ({
              root: {
                backgroundColor: theme.colorScheme === 'dark' ? '#000b10' : '#edf9ff',
                border: '0px',
              },
            })}
            p="xl"
          >
            <Button
              p="md"
              h="48px"
              styles={() => ({
                root: {
                  backgroundColor: '#2fa3cf',
                },
              })}
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="3" stroke="#fff" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
                <path stroke="none" d="M0 0h24v24H0z" fill="none" />
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              {' '}
              <span style={{ fontWeight: 400, fontSize: '1rem' }}>Luo uusi</span>
            </Button>
          </Navbar>
        )}
        header={(
          <Header
            height={50}
            p="xs"
            styles={() => ({
              root: {
                border: '0px',
              },
            })}
          >
            ohjelmoi.fi v2
          </Header>
        )}
        styles={(theme) => ({
          main: { backgroundColor: theme.colorScheme === 'dark' ? '#000b10' : '#edf9ff' },
        })}
      >
        <div>
          {runState || 'State unknown'}
          {' '}
          {message}
          <CodeEditor codeRunner={codeRunner} />
          <Input codeRunner={codeRunner} />
          <Output />
        </div>
      </AppShell>
    </MantineProvider>
  );
}

export default App;
