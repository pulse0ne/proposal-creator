'use strict';

import { app, BrowserWindow, ipcMain as ipc, shell } from 'electron';
const fs = require('fs');
const os = require('os');
const path = require('path');

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = require('path').join(__dirname, '/static').replace(/\\/g, '\\\\');
}

let mainWindow;
const winURL = process.env.NODE_ENV === 'development'
    ? `http://localhost:9080`
    : `file://${__dirname}/index.html`;

function createWindow () {
    /**
     * Initial window options
     */
    mainWindow = new BrowserWindow({
        height: 800,
        useContentSize: true,
        width: 1000
    });

    mainWindow.loadURL(winURL);

    mainWindow.on('closed', () => {
        mainWindow = null;
    });
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

app.on('activate', () => {
    if (mainWindow === null) {
        createWindow();
    }
});

ipc.on('print-to-pdf', event => {
    const pdfPath = path.join(os.tmpdir(), 'test.pdf');
    const win = BrowserWindow.fromWebContents(event.sender);
    win.webContents.printToPDF({ pageSize: 'Letter', marginsType: 2 }, (error, data) => {
        if (error) return console.error(error.message);

        fs.writeFile(pdfPath, data, err => {
            if (err) return console.error(err.message);
            shell.openExternal('file://' + pdfPath);
            event.sender.send('wrote-pdf', pdfPath);
        });
    });
});
