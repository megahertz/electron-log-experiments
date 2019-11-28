'use strict';

const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const writeLogData = require('./logging').writeLogData;

const isLoggingFinished = { main: false, renderer: false };

app.on('ready', onReady);

function onLoggingFinish(processName) {
  isLoggingFinished[processName] = true;
  if (isLoggingFinished.main && isLoggingFinished.renderer) {
    app.quit();
  }
}

function onReady() {
  const win = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: { nodeIntegration: true },
  });

  win.hide();
  win.loadURL('file://' + path.join(__dirname, 'index.html'));

  ipcMain.on('renderer-started', () => {
    writeLogData('main');
    onLoggingFinish('main');
  });

  ipcMain.on('renderer-finished', () => {
    onLoggingFinish('renderer');
  });
}
