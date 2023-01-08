import { Button, Stack } from '@mantine/core';
import React, { useEffect, useState } from 'react';
import { useIndexedDB } from 'react-indexed-db';
import FileButton from './FileButton';

interface File {
  name: string;
  last_edited: Date;
  content: string;
}

export default function FileNavigator() {
  const db = useIndexedDB('files');

  const [files, setFiles] = useState<File[]>([]);
  const [selected, setSelected] = useState(0);

  return (
    <>
      <Button
        p="md"
        h="48px"
        styles={() => ({
          root: {
            backgroundColor: '#2fa3cf',
          },
        })}
        sx={{
          transitionProperty: 'background-color',
          transitionDuration: '250ms',
        }}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" strokeWidth="3" stroke="#fff" fill="none" strokeLinecap="round" strokeLinejoin="round" style={{ marginRight: '5px' }}>
          <path stroke="none" d="M0 0h24v24H0z" fill="none" />
          <line x1="12" y1="5" x2="12" y2="19" />
          <line x1="5" y1="12" x2="19" y2="12" />
        </svg>
        {' '}
        <span style={{ fontWeight: 400, fontSize: '1rem' }}>Luo uusi</span>
      </Button>
      <Stack spacing="lg" align="stretch" justify="flex-start" mt="md">
        {files.map((f: File, index: number) => (
          <FileButton
            name={f.name}
            lastEdited={f.last_edited}
            selected={selected === index}
            onClick={() => setSelected(index)}
          />
        ))}
      </Stack>
    </>
  );
}
