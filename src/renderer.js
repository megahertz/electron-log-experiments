'use strict'

const { ipcRenderer } = require('electron');
const { writeLogData } = require('./logging');

ipcRenderer.send('renderer-started');
writeLogData('rend');
ipcRenderer.send('renderer-finished');
