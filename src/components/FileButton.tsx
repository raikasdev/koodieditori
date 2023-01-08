import {
  Group, Text, UnstyledButton,
} from '@mantine/core';
import React from 'react';
import { dateFormat } from '../util/util';

export default function FileButton({
  name,
  lastEdited,
  selected,
  onClick,
}: {
  name: string,
  lastEdited: Date,
  selected: boolean,
  onClick: () => void
}) {
  return (
    <UnstyledButton
      bg={selected ? '#e1e9ec' : '#fff'}
      sx={{
        borderRadius: '5px',
        boxShadow: '0 3px 10px rgba(0,0,0,.05)', // '0 1px 2px 0 rgb(0 0 0 / 0.05)',
        padding: '12px',
        transitionProperty: 'background-color',
        transitionDuration: '250ms',
      }}
      onClick={onClick}
    >
      <Group>
        <div>
          <Text>{name}</Text>
          <Text size="xs" color="dimmed">{dateFormat(lastEdited)}</Text>
        </div>
      </Group>
    </UnstyledButton>
  );
}
