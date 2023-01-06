import React, { useState } from 'react';
import CodeMirror, { ReactCodeMirrorRef } from '@uiw/react-codemirror';
import { python } from '@codemirror/lang-python';
import { Button } from '@mantine/core';

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
import { CodeRunner, RunState } from '../python/code-runner';

function CodeEditor({ codeRunner }: { codeRunner: CodeRunner | null }) {
  const [code, setCode] = useState('print("Hello ", input("What\'s your name?"), "!")');
  const ref = React.useRef<ReactCodeMirrorRef>();

  if (!codeRunner || codeRunner.lintSource == null || codeRunner.completionSource == null) {
    return (
      <>Ladataan koodisuorittajaa</>
    );
  }

  return (
    <>
      <CodeMirror
        value={code}
        height="50vh"
        extensions={[
          python(),
          linter(codeRunner.lintSource),
          autocompletion({ override: [codeRunner.completionSource] }),
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
        ]}
        onChange={(v) => setCode(v)}
        ref={ref as any}
      />
      <Button
        color={codeRunner.state === RunState.Ready ? 'green' : 'red'}
        onClick={() => (codeRunner.state === RunState.Ready
          ? codeRunner?.runCode(code)
          : codeRunner.stopCode())}
      >
        {codeRunner.state === RunState.Ready ? 'Suorita' : 'Pysäytä'}
      </Button>
    </>
  );
}

export default CodeEditor;
