import fs from "fs";
import fspath from "path";
import pico from "picocolors";

/**
 * Checks if a directory is within its parent
 *
 * @param parent  Parent path name
 * @param dir  Child path name
 *
 * @remarks
 *
 * https://stackoverflow.com/questions/37521893/determine-if-a-path-is-subdirectory-of-another-in-node-js
 *
 * @returns True if dir is within its parent.
 *
 */
const isRelative = (parent: string, dir: string): Boolean => {
  const relative = fspath.relative(parent, dir);
  return (
    Boolean(relative == "") ||
    (Boolean(relative) &&
      !relative.startsWith("..") &&
      !fspath.isAbsolute(relative))
  );
};

/**
 * Recursively scans all files within a folder
 *
 * @param dirPath  Folder to scan
 * @param arrayOfFiles found files will be appended to this array
 *
 * @remarks
 *
 * https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 *
 * @returns Array of paths
 *
 */
const getAllFiles = function (
  dirPath: string,
  arrayOfFiles?: string[]
): string[] {
  const resDir = fspath.resolve(dirPath);
  const aof: string[] = arrayOfFiles || [];
  try {
    const files = fs.readdirSync(resDir);
    files.forEach(function (file) {
      if (fs.statSync(resDir + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(resDir + "/" + file, aof);
      } else {
        aof.push(resDir + "/" + file);
      }
    });
  } catch (error) {
    arrayOfFiles = [];
  }
  return aof;
};

/**
 * Class with similar functionality to javascript setInterval
 *
 * @param id  Passed into ping function
 * @param func Function to call on ping intervals with id
 * @param timeout Ping interval in seconds
 *
 */
class Pinger {
  readonly timeout;
  readonly id: string;
  private _done: boolean = false;
  private timer: NodeJS.Timeout | null = null;
  private ping: (id: string) => void;
  constructor(id: string, func: (id: string) => void, timeout: number = 2000) {
    this.id = id;
    this.ping = func;
    this.timeout = timeout;
    this._startTimer();
  }
  private _startTimer() {
    this.timer = setTimeout(() => {
      this.ping(this.id);
      if (!this._done) this._startTimer();
    }, this.timeout);
  }
  stop() {
    if (this.timer) {
      this._done = true;
      clearTimeout(this.timer);
      this.timer = null;
    }
  }
  restart() {
    this.stop();
    this._startTimer();
  }
}

const _formatLog = (prefix: string, useChalk = pico.green, ...args: any) => {
  for (let arg of args) {
    let txt;
    if (typeof arg === "string" || (arg as any) instanceof String) {
      txt = arg;
    } else {
      txt = JSON.stringify(arg, null, 2);
    }
    console.log(useChalk(prefix + pico.bold(arg)));
  }
};

/**
 * Returns log and logError functions with a prefix, optional error flag, and chalk colors.
 *
 * @param prefix Every call to log and logError will be prefixed by this
 * @param errorFlag Every call to logError will have this following the prefix
 * @param goodColor log messages will be colored with this
 * @param badCOlor logError messages will be colored with this
 *
 * @remarks
 *
 * https://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
 *
 * @returns Array of paths
 *
 */
const makeLoggers = (
  prefix: string,
  errorFlag: string = "[ERROR] ",
  goodColor = pico.green,
  badColor = pico.red
) => {
  return {
    log: _formatLog.bind(null, prefix, goodColor),
    logError: _formatLog.bind(null, prefix + errorFlag, badColor),
  };
};

export { isRelative, getAllFiles, Pinger, makeLoggers };
