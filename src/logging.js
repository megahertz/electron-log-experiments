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
  const digits = count.toString(10).length;

  for (let i = 0; i < count; i++) {
    const index = (i + 1).toString(10).padStart(digits, '0');
    const data = char.repeat(size);
    log.info(`${name}-${index}-${data}`);
  }
}
