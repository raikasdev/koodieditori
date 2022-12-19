importScripts("https://unpkg.com/synclink@0.1.0/dist/umd/synclink.min.js");

async function fetch(url) {
  const resp = await fetch(url);
  return await resp.text();
}
