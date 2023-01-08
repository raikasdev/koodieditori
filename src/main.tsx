import React from 'react';
import ReactDOM from 'react-dom/client';
import {
  createBrowserRouter,
  RouterProvider,
} from 'react-router-dom';
import browserDetect from 'browser-detect';
import { MantineProvider } from '@mantine/core';

import './index.css';

import App from './App';
import NonSupportedBrowser from './NonSupportedBrowser';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
  },
]);

const browser = browserDetect();

const isUnsupportedBrowser = browser.name === 'firefox'; // No support for new Worker('', { type: "module" })

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <MantineProvider withGlobalStyles withNormalizeCSS>
    <div style={{
      minHeight: '100vh',
    }}
    >
      {isUnsupportedBrowser
        ? <NonSupportedBrowser />
        : <RouterProvider router={router} />}
    </div>
  </MantineProvider>,
);
