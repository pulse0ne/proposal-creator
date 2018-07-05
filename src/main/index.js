'use strict';

import { app, BrowserWindow, dialog, ipcMain as ipc, shell } from 'electron';
const fs = require('fs');
const path = require('path');

let lastPath;

/**
 * Set `__static` path to static files in production
 * https://simulatedgreg.gitbooks.io/electron-vue/content/en/using-static-assets.html
 */
if (process.env.NODE_ENV !== 'development') {
    global.__static = path.join(__dirname, '/static').replace(/\\/g, '\\\\');
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

ipc.on('save-to-pdf', event => {
    const win = BrowserWindow.fromWebContents(event.sender);
    const pdfPath = dialog.showSaveDialog({
        title: 'Save Proposal PDF',
        defaultPath: lastPath ? lastPath.replace(/\.html$/, '.pdf') : path.join(app.getPath('home'), 'proposal.pdf'),
        filters: [{ name: 'PDF (*.pdf)', extensions: ['pdf'] }]
    });
    if (pdfPath) {
        lastPath = pdfPath;
        win.webContents.printToPDF({ pageSize: 'Letter', marginsType: 2 }, (err, data) => {
            if (err) {
                event.sender.send('error', err.message);
                return;
            }

            fs.writeFile(pdfPath, data, err => {
                if (err) {
                    console.error(err.message);
                    event.sender.send('error', err.message);
                } else {
                    shell.openExternal('file://' + pdfPath);
                    event.sender.send('wrote-pdf');
                }
            });
        });
    } else {
        event.sender.send('wrote-pdf');
    }
});

ipc.on('save-to-html', (event, page) => {
    const htmlPath = dialog.showSaveDialog({
        title: 'Save Proposal HTML',
        defaultPath: lastPath ? lastPath.replace(/\.pdf$/, '.html') : path.join(app.getPath('home'), 'proposal.html'),
        filters: [{ name: 'HTML (*.html)', extensions: ['html'] }]
    });
    if (htmlPath) {
        lastPath = htmlPath;
        let head = page.head.replace(/<script.*?>.*?<\/script>/g, '').replace(/\/\*.*?source.*?URL=.+?\*\//g, '');
        let body = page.body.replace(/<script.*?>.*?<\/script>/g, '').replace(/\/\*.*?source.*?URL=.+?\*\//g, '');
        let html = `<!DOCTYPE html><html><head>${head}</head><body>${body}</body></html>`;
        fs.writeFile(htmlPath, html, err => {
            if (err) {
                console.error(err.message);
                event.sender.send('error', err.message);
            } else {
                event.sender.send('wrote-html');
            }
        });
    } else {
        event.sender.send('wrote-html');
    }
});

ipc.on('update-autocompletes', (event, autocompletes) => {
    console.log(autocompletes);
});
