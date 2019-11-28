#!/usr/bin/env node

'use strict';

const log = require('electron-log');
const fs = require('fs');
const readline = require('readline');

main().catch(console.error);

async function main() {
  log.transports.file.level = false;

  const logPath = log.transports.file.getFile().path;
  const stat = await checkLogFile(logPath);

  let ok = true;
  Object.values(stat).forEach((value) => {
    const name = value.name === 'rend' ? 'renderer' : value.name;
    if (value.corrupted.length > 0) {
      ok = false;
      log.warn(`Corrupted records (${name}):`, value);
    }
  });

  if (ok) {
    log.info('Check: OK');
  } else {
    log.error('Check: Failed');
    process.exitCode = 1;
  }

  log.info('Path:', logPath);
  log.info('Size:', formatSize(fs.statSync(logPath).size));
}

/**
 * @param {string} filePath
 * @return {Promise<Object<string, object>>}
 */
async function checkLogFile(filePath) {
  const stat = {};
  const reader = readline.createInterface({
    input: fs.createReadStream(filePath, 'utf8'),
  });

  return new Promise((resolve, reject) => {
    reader.on('line', (line) => {
      calcStat(stat, parseLine(line));
    });

    reader.on('close', () => resolve(stat));
    reader.on('error', reject);
  });
}

function parseLine(line) {
  const [
    _,
    time,
    name,
    id,
    data,
  ] = line.match(/([\w :.-]+) (\w+)-(\d+)-(\w+)/) || [];

  if (!name) {
    return null;
  }

  let wrongData = false;
  if (!data.match(new RegExp(`^${data[0]}+$`))) {
    wrongData = data;
  }

  return {
    char: data[0],
    size: data.length,
    id: parseInt(id),
    name: name,
    wrongData,
  };
}

function calcStat(stat, item) {
  let itemStat = stat[item.name];

  if (!itemStat) {
    itemStat = {
      name: item.name,
      prevId: 0,
      size: item.size,
      char: item.char,
      corrupted: [],
    };
    stat[item.name] = itemStat;
  }

  if (itemStat.prevId + 1 !== item.id) {
    itemStat.corrupted.push({
      id: item.id,
      reason: 'prevId = ' + itemStat.prevId + ', id = ' + item.id,
    });
  }

  itemStat.prevId = item.id;

  if (itemStat.char !== item.char) {
    itemStat.corrupted.push({
      id: item.id,
      reason: 'prevChar = ' + itemStat.char + ', char = ' + item.char,
    });
  }

  if (itemStat.size !== item.size) {
    itemStat.corrupted.push({
      id: item.id,
      reason: 'prevSize = ' + itemStat.size + ', size = ' + item.size,
    });
  }

  if (item.wrongData) {
    itemStat.corrupted.push({
      id: item.id,
      reason: 'wrongData = ' + item.wrongData,
    });
  }

  return stat;
}

function formatSize(bytes) {
  if (bytes === 0) return '0b';
  const e = Math.floor(Math.log(bytes) / Math.log(1024));
  // eslint-disable-next-line no-restricted-properties
  return +(bytes / (Math.pow(1024, e))).toFixed(2)
    + 'bkmgtp'.charAt(e).replace('b', '') + 'b';
}
