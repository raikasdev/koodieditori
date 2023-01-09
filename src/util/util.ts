/* eslint-disable no-restricted-globals */

import Logger from './logger';

/**
 * Obtain the url of the current page without hashes, identifiers, query params, ...
 * @param {boolean} endingSlash Whether the url should end in a slash
 * @return {string} The current url
 */
export function cleanCurrentUrl(endingSlash = false): string {
  let url = location.origin + location.pathname;
  if (endingSlash && !url.endsWith('/')) {
    url += '/';
  } else if (!endingSlash && url.endsWith('/')) {
    url = url.slice(0, url.length - 1);
  }
  return url;
}

/**
 * Parse the data contained within a PapyrosEvent using its contentType
 * Supported content types are: text/plain, text/json, img/png;base64
 * @param {string} data The data to parse
 * @param {string} contentType The content type of the data
 * @return {any} The parsed data
 */
export function parseData(data: string, contentType?: string): any {
  if (!contentType) {
    return data;
  }
  const [baseType, specificType] = contentType.split('/');
  switch (baseType) {
    case 'text': {
      switch (specificType) {
        case 'plain': {
          return data;
        }
        case 'json': {
          return JSON.parse(data);
        }
        case 'integer': {
          return parseInt(data, 10);
        }
        case 'float': {
          return parseFloat(data);
        }
        default:
          Logger.log(`Unhandled content type: ${contentType}`);
          return data;
      }
      break;
    }
    case 'img': {
      switch (specificType) {
        case 'png;base64': {
          return data;
        }
        case 'svg+xml':
          return data;
        default:
          Logger.log(`Unhandled content type: ${contentType}`);
          return data;
      }
      break;
    }
    case 'application': {
      // Content such as application/json does not need parsing as it is in the correct shape
      return data;
    }
    default:
      Logger.log(`Unhandled content type: ${contentType}`);
      return data;
  }
}

export function dateFormat(date: Date) {
  if (date.getDate() === new Date().getDate()
  && date.getMonth() === new Date().getMonth()
  && date.getFullYear() === new Date().getFullYear()) {
    return `Tänään ${date.toLocaleTimeString('fi', { timeStyle: 'short' })}`;
  }
  if (date.getDate() === (new Date().getDate() - 1)
  && date.getMonth() === new Date().getMonth()
  && date.getFullYear() === new Date().getFullYear()) {
    return `Eilen ${date.toLocaleTimeString('fi', { timeStyle: 'short' })}`;
  }
  return `${date.toLocaleDateString('fi')} ${date.toLocaleTimeString('fi', { timeStyle: 'short' })}`;
}

export function download(data: string) {
  const blob = new Blob([data], { type: 'text/plain' });
  const elem = window.document.createElement('a');
  // Cast URL to any as TypeScript doesn't recognize it properly
  // error TS2339: Property 'revokeObjectURL' does not exist on type
  const windowUrl = URL as any;
  elem.href = windowUrl.createObjectURL(blob);
  elem.download = 'overflow_results.txt';
  document.body.appendChild(elem);
  elem.click();
  document.body.removeChild(elem);
  windowUrl.revokeObjectURL(elem.href);
}
