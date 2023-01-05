/**
 * Obtain the url of the current page without hashes, identifiers, query params, ...
 * @param {boolean} endingSlash Whether the url should end in a slash
 * @return {string} The current url
 */
export function cleanCurrentUrl(endingSlash = false): string {
  let url = location.origin + location.pathname;
  if (endingSlash && !url.endsWith("/")) {
    url += "/";
  } else if (!endingSlash && url.endsWith("/")) {
    url = url.slice(0, url.length - 1);
  }
  return url;
}