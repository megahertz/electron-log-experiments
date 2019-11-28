'use strict'

const log = require('electron-log');

module.exports = {
  writeLogData: writeLogData,
};

function writeLogData(name = 'none', count = null, size = null) {
  count = count || parseInt(process.env.COUNT) || 10000;
  size = size || parseInt(process.env.SIZE) || 1024;

  log.transports.console.level = false;
  log.transports.ipc.level = false;
  log.transports.file.maxSize = 0;
  log.transports.file.fileName = 'main.log';
  log.transports.file.format = '{iso} {text}';

  const char = name[0];
  for (let i = 0; i < count; i++) {
    log.info(`${name}-${(i + 1)}-${char.repeat(size)}`);
  }
}
