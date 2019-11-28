'use strict'

const { ipcRenderer } = require('electron');
const { writeLogData } = require('./logging');

ipcRenderer.send('renderer-started');
writeLogData('renderer');
ipcRenderer.send('renderer-finished');
