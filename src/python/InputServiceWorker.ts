/* eslint-disable no-restricted-globals */
/// <reference no-default-lib="true"/>
/// <reference lib="esnext" />
/// <reference lib="webworker" />
// Import service worker provided by the Papyros-package
import InputWorker from '../workers/input/InputWorker';

const sw = self as unknown as ServiceWorkerGlobalScope & typeof globalThis;

// Strip away the filename of the script to obtain the scope
let domain = location.href;
domain = domain.slice(0, domain.lastIndexOf('/') + 1);
// const domain = ''; // Disable SharedArrayBuffers to use same environment as Dodona
const inputHandler = new InputWorker(domain);

sw.addEventListener('fetch', async (event: FetchEvent) => {
  if (!await inputHandler.handleInputRequest(event)) {
    // Not a Papyros-specific request
    // Fetch as we would handle a normal request
    // Default action is to let browser handle it by not responding here

  }
});
// Prevent needing to reload page to have working input
sw.addEventListener('install', (event: ExtendableEvent) => {
  event.waitUntil(sw.skipWaiting());
});
sw.addEventListener('activate', (event: ExtendableEvent) => {
  event.waitUntil(sw.clients.claim());
});

export { };
