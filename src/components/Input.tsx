import React, { useState } from 'react';
import { TextInput } from '@mantine/core';
import useInit from '../hooks/use-init';
import { BackendManager } from '../python/backend-manager';
import { BackendEventType } from '../python/backend-event';
import { CodeRunner } from '../python/code-runner';

function Input({ codeRunner }: { codeRunner: CodeRunner | null }) {
  const [prompt, setPrompt] = useState('');
  const [value, setValue] = useState('');

  useInit(() => {
    BackendManager.subscribe(BackendEventType.Input, (event) => {
      setPrompt(event.data);
    });
    BackendManager.subscribe(BackendEventType.End, () => {
      setPrompt('');
    });
  });

  return (
    <TextInput
      label="Syöte"
      value={value}
      disabled={prompt === ''}
      placeholder={prompt}
      onChange={(e) => setValue(e.currentTarget.value)}
      onKeyDown={(e) => {
        if (e.key === 'Enter' && prompt !== '') {
          codeRunner?.submitInput(value);
          setValue('');
          setPrompt('');
        }
      }}
    />
  );
}

export default Input;
