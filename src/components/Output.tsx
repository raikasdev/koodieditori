import React, { useState } from 'react';
import {
  Alert, Button, Image, Text,
} from '@mantine/core';
import { IconInfoCircle } from '@tabler/icons';
import useInit from '../hooks/use-init';
import { BackendManager } from '../python/backend-manager';
import { BackendEventType } from '../python/backend-event';
import Logger from '../util/logger';
import { parseData } from '../util/util';
import { CodeRunner } from '../python/code-runner';

/**
 * Shape of Error objects that are easy to interpret
 */
export interface FriendlyError {
  /**
   * The name of the Error
   */
  name: string;
  /**
   * Traceback for where in the code the Error occurred
   */
  traceback?: string;
  /**
   * General information about this type of Error
   */
  info?: string;
  /**
  * Information about what went wrong in this case
  */
  what?: string;
  /**
   * Information about why this is wrong and how to fix it
   */
  why?: string;
  /**
   * Where specifically in the source code the Error occurred
   */
  where?: string;
}

type OutputLine = {
  type: 'text' | 'image' | 'alert'
  value: string
  error?: boolean
  contentType?: string;
  title?: string;
};

function Output({ codeRunner }: { codeRunner: CodeRunner | null }) {
  /**
     * Store the HTML that is rendered to restore when changing language/theme
     */
  const [content, setContent] = useState<OutputLine[]>([
    {
      type: 'text',
      value: 'Koodin tuloste ilmestyy tähän.',
    },
  ]);

  useInit(() => {
    BackendManager.subscribe(BackendEventType.Output, (output) => {
      const data = parseData(output.data, output.contentType);
      if (output.contentType && output.contentType.startsWith('img')) {
        setContent((c) => c.concat([{ type: 'image', value: data, contentType: output.contentType }]));
      } else {
        setContent((c) => {
          const arr = data.split(/(\n)/).map((text: string) => ({ type: 'text', value: text }));
          Logger.log(arr);
          if (arr.length === 1) {
            if (c.length === 0) c.push({ type: 'text', value: '' });
            // eslint-disable-next-line no-param-reassign
            c[c.length - 1].value += arr[0].value;
            return [...c];
          }
          if (arr[arr.length - 1].value === '') arr.pop();
          return c.concat(arr.map((i: OutputLine) => (i.value === '\n' ? { type: 'text', value: '' } : i)));
        });
      }
    });
    BackendManager.subscribe(BackendEventType.Error, (error) => {
      const errorData = parseData(error.data, error.contentType);
      if (typeof (errorData) === 'string') {
        setContent((c) => c.concat([{ type: 'text', value: errorData }]));
      } else {
        let events: OutputLine[] = [];
        const errorObject = errorData as FriendlyError;
        const shortTraceback = (errorObject.where || '').trim();
        // Prepend a bit of indentation, so every part has indentation
        if (errorObject.info) events.push({ type: 'alert', title: 'Info', value: errorObject.info });
        events.push({ type: 'text', value: `${errorObject.name}`, error: true });
        if (shortTraceback) {
          events = events.concat([...(shortTraceback.split('\n').map((i) => ({ type: 'text', value: i, error: true })) as any)]);
        }
        if (errorObject.traceback) events.push({ type: 'alert', title: 'Traceback', value: errorObject.traceback });
        if (errorObject.what) {
          events.push({ type: 'text', value: 'What', error: true });
          events = events.concat([...(errorObject.what.split('\n').map((i) => ({ type: 'text', value: i, error: true })) as any)]);
        }
        if (errorObject.why) {
          events.push({ type: 'text', value: 'Why', error: true });
          events = events.concat([...(errorObject.why.split('\n').map((i) => ({ type: 'text', value: i, error: true })) as any)]);
        }
        setContent((c) => c.concat(events));
      }
    });
    BackendManager.subscribe(BackendEventType.Start, () => {
      setContent([]);
    });
  });
  Logger.log(content);
  return (
    <Text
      sx={{
        borderRadius: '5px',
        backgroundColor: '#111',
        width: '100%',
        height: '700px',
        overflowY: 'scroll',
        whiteSpace: 'pre-wrap',
        padding: '0.5rem',
        color: 'white',
        fontFamily: 'monospace',
      }}
    >
      {content.map((i) => {
        if (i.type === 'image') Logger.log(i.value);
        switch (i.type) {
          case 'text':
            if (i.value === '') return <br key={content.indexOf(i)} />;
            return i.value;
          case 'image':
            if (i.contentType === 'img/svg+xml') {
              return (
                <div
                  // eslint-disable-next-line react/no-danger
                  dangerouslySetInnerHTML={{ __html: i.value }}
                />
              );
            }
            return (
              <Image
                height={480}
                width="auto"
                src={`data:${i.contentType},${i.value}`}
                alt="Random unsplash image"
              />
            );

          case 'alert':
            return (
              <div style={{
                marginTop: '0.5rem',
                marginBottom: '0.5rem',
              }}
              >
                <Alert
                  icon={<IconInfoCircle size={16} />}
                  title={i.title}
                  color="blue"
                >
                  {i.value}
                </Alert>
              </div>
            );
          default:
            return null;
        }
      })}
      {codeRunner?.overflown && (
        <Text color="red">
          Tulos katkaistu
          {codeRunner.overflownAction && (
          <>
            <br />
            <Button onClick={codeRunner.overflownAction}>Lataa tuloste</Button>
          </>
          )}
        </Text>
      )}
    </Text>
  );
}

export default Output;
