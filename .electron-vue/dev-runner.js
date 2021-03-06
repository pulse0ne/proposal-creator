'use strict';

const chalk = require('chalk');
const electron = require('electron');
const path = require('path');
const { say } = require('cfonts');
const { spawn } = require('child_process');
const webpack = require('webpack');
const WebpackDevServer = require('webpack-dev-server');
const webpackHotMiddleware = require('webpack-hot-middleware');

const mainConfig = require('./webpack.main.config');
const rendererConfig = require('./webpack.renderer.config');

let electronProcess = null;
let manualRestart = false;
let hotMiddleware;

function logStats (proc, data) {
    let log = '';

    log += chalk.yellow.bold(`┏ ${proc} Process ${new Array((19 - proc.length) + 1).join('-')}`);
    log += '\n';

    if (typeof data === 'object') {
        data.toString({
            colors: true,
            chunks: false
        }).split(/\r?\n/).forEach(line => {
            log += chalk.yellow.bold('|') + ' ' + line + '\n';
        });
    } else {
        log += `${chalk.yellow.bold('|')} ${data}\n`;
    }

    log += chalk.yellow.bold(`┗ ${new Array(28 + 1).join('-')}`);

    console.log(log);
}

function startRenderer () {
    return new Promise((resolve, reject) => {
        rendererConfig.entry.renderer = [path.join(__dirname, 'dev-client')].concat(rendererConfig.entry.renderer);

        const compiler = webpack(rendererConfig);
        hotMiddleware = webpackHotMiddleware(compiler, {
            log: false,
            heartbeat: 2500
        });

        compiler.plugin('compilation', compilation => {
            compilation.plugin('html-webpack-plugin-after-emit', (data, cb) => {
                hotMiddleware.publish({ action: 'reload' });
                cb();
            });
        });

        compiler.plugin('done', stats => {
            logStats('Renderer', stats);
        });

        const server = new WebpackDevServer(
            compiler,
            {
                contentBase: path.join(__dirname, '../'),
                quiet: true,
                before (app, ctx) {
                    app.use(hotMiddleware);
                    ctx.middleware.waitUntilValid(() => {
                        resolve();
                    });
                }
            }
        );

        server.listen(9080);
    });
}

function startMain () {
    return new Promise((resolve, reject) => {
        mainConfig.entry.main = [path.join(__dirname, '../src/main/index.dev.js')].concat(mainConfig.entry.main);

        const compiler = webpack(mainConfig);

        compiler.plugin('watch-run', (compilation, done) => {
            logStats('Main', chalk.white.bold('compiling...'));
            hotMiddleware.publish({ action: 'compiling' });
            done();
        });

        compiler.watch({}, (err, stats) => {
            if (err) {
                console.log(err);
                return;
            }

            logStats('Main', stats);

            if (electronProcess && electronProcess.kill) {
                manualRestart = true;
                process.kill(electronProcess.pid);
                electronProcess = null;
                startElectron();

                setTimeout(() => {
                    manualRestart = false;
                }, 5000);
            }

            resolve();
        });
    });
}

function startElectron () {
    let proxy = process.env.HTTP_PROXY || process.env.http_proxy;
    let sproxy = process.env.HTTPS_PROXY || process.env.https_proxy;
    let p = '--proxy-server=';
    if (proxy) p += `http=${proxy}${sproxy ? ';https=' + sproxy : ''}`;
    else if (sproxy) p += `https=${sproxy}`;
    let flags = (proxy || sproxy) ? [p, '--proxy-bypass-list=<local>', '--inspect=5858', '.'] : ['--inspect=5858', '.'];
    electronProcess = spawn(electron, flags);

    electronProcess.stdout.on('data', data => {
        electronLog(data, 'blue');
    });
    electronProcess.stderr.on('data', data => {
        electronLog(data, 'red');
    });

    electronProcess.on('close', () => {
        if (!manualRestart) process.exit();
    });
}

function electronLog (data, color) {
    const log = data.toString().split(/\r?\n/).filter(i => i !== '').map(i => `${chalk[color].bold('|')} ${i}\n`).join('');
    if (/[0-9A-z]+/.test(log)) {
        console.log(
            chalk[color].bold('┏ Electron -------------------') +
            '\n' +
            log +
            chalk[color].bold('┗ ----------------------------')
        );
    }
}

function init () {
    Promise.all([startRenderer(), startMain()]).then(() => startElectron()).catch(err => console.error(err));
}

init();
