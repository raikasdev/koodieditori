import React, { useState } from 'react';
import {
  AppShell, Center, Grid, Header, Loader, LoadingOverlay, Navbar, Text,
} from '@mantine/core';

import { CodeRunner, RunState } from './python/code-runner';
import { BackendManager } from './python/backend-manager';
import { BackendEventType } from './python/backend-event';
import useInit from './hooks/use-init';
import Logger from './util/logger';
import CodeEditor from './components/CodeEditor';
import Input from './components/Input';
import Output from './components/Output';
import FileNavigator from './components/FileNavigator';

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

    <AppShell
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
      <div style={{ position: 'relative' }}>
        <LoadingOverlay
          visible={runState === RunState.Loading || !codeRunner?.completionSource}
          overlayBlur={2}
          transitionDuration={300}
          loader={(
            <>
              <Center mb={20}><Loader /></Center>
              <Text align="center" weight={700}>Ladataan Python-ympäristöä</Text>
            </>
          )}
        />
        <Grid>
          <Grid.Col span={6}>
            <CodeEditor codeRunner={codeRunner} runState={runState} message={message} />
            <Input codeRunner={codeRunner} />
          </Grid.Col>
          <Grid.Col span={6}>
            <Output />
          </Grid.Col>
        </Grid>

      </div>
    </AppShell>
  );
}

export default App;
