import React, { useEffect, useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import {
  Box, Button, Center, Group, Select, Text,
} from '@mantine/core';

import { lintGutter, lintKeymap, linter } from '@codemirror/lint';
import {
  autocompletion, closeBrackets, closeBracketsKeymap, completionKeymap,
} from '@codemirror/autocomplete';
import {
  drawSelection, highlightActiveLine,
  highlightActiveLineGutter,
  highlightSpecialChars,
  keymap,
  lineNumbers,
  rectangularSelection,
} from '@codemirror/view';
import {
  defaultKeymap, history, historyKeymap, indentWithTab,
} from '@codemirror/commands';
import { highlightSelectionMatches, searchKeymap } from '@codemirror/search';

import {
  bracketMatching, foldGutter, foldKeymap, indentOnInput,
} from '@codemirror/language';
import { EditorState } from '@codemirror/state';
import { useDebouncedValue } from '@mantine/hooks';

import { CodeRunner, RunState } from '../python/code-runner';
import examples from '../examples';

const transformState = (state: RunState) => {
  switch (state) {
    case RunState.Ready:
      return 'Valmiina suoritettavaksi';
    case RunState.AwaitingInput:
      return 'Odottaa syötettä';
    case RunState.Loading:
      return 'Ladataan Python-ympäristöä';
    case RunState.Running:
      return 'Koodin suoritus kesken';
    case RunState.Stopping:
      return 'Sammutetaan';
    default:
      return 'Tuntematon tila';
  }
};

function CodeEditor(
  { codeRunner, runState, message }:
  { codeRunner: CodeRunner | null, runState: RunState, message: string },
) {
  const [code, setCode] = useState(localStorage.getItem('code') || 'print("Hello ", input("What\'s your name?"), "!")');

  const [debounced] = useDebouncedValue(code, 1000);

  useEffect(() => {
    localStorage.setItem('code', debounced);
  }, [debounced]);

  const ref = React.useRef<ReactCodeMirrorRef>();

  if (!codeRunner || !codeRunner?.lintSource || !codeRunner?.completionSource) {
    return null;
  }

  return (
    <>
      <CodeMirror
        value={code}
        height="50vh"
        extensions={[
          python(),
          lintGutter(),
          lineNumbers(),
          highlightSpecialChars(),
          history(),
          foldGutter(),
          drawSelection(),
          EditorState.allowMultipleSelections.of(true),
          indentOnInput(),
          bracketMatching(),
          closeBrackets(),
          rectangularSelection(),
          highlightActiveLine(),
          highlightActiveLineGutter(),
          highlightSelectionMatches(),
          keymap.of([
            ...closeBracketsKeymap,
            ...defaultKeymap,
            ...searchKeymap,
            ...historyKeymap,
            ...foldKeymap,
            ...completionKeymap,
            ...lintKeymap,
            indentWithTab,
          ]),
          linter(codeRunner.lintSource),
          autocompletion({ override: [codeRunner.completionSource] }),
        ]}
        onChange={(v) => setCode(v)}
        ref={ref as any}
      />
      <Box sx={{
        backgroundColor: '#f5f5f5',
        borderRadius: '2px',
        borderTop: '1px solid #ddd',
        padding: '4px',
      }}
      >
        <Group position="apart">
          <Button
            bg={codeRunner?.state === RunState.Ready ? '#2fa3cf' : 'red'}
            color={codeRunner?.state === RunState.Ready ? '' : 'red'}
            sx={{
              transitionProperty: 'background-color',
              transitionDuration: '250ms',
            }}
            onClick={() => (codeRunner?.state === RunState.Ready
              ? codeRunner?.runCode(code)
              : codeRunner?.stopCode())}
          >
            {codeRunner?.state === RunState.Ready ? 'Suorita' : 'Pysäytä'}
          </Button>
          <Select
            placeholder="Esimerkit"
            data={Object.keys(examples).map((i) => ({ value: i, label: i }))}
            onChange={(value) => (value == null ? null : setCode((examples as any)[value]))}
          />
          <Center>
            <Text align="right">
              Tila:
              {' '}
              {transformState(runState)}
              {' '}
              {message && '| '}
              {message}
            </Text>
          </Center>
        </Group>
      </Box>
    </>
  );
}

export default CodeEditor;
