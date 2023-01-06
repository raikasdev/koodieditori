/* eslint-disable no-console */

export default class Logger {
  public static log(text: any, ...optionalParameters: any[]) {
    if (import.meta.env.PROD) return;
    console.log(text, optionalParameters);
  }

  public static error(text: any, ...optionalParameters: any[]) {
    if (import.meta.env.PROD) return;
    console.error(text, optionalParameters);
  }

  public static debug(text: any, ...optionalParameters: any[]) {
    if (import.meta.env.PROD) return;
    console.debug(text, optionalParameters);
  }
}
