const http = require('http');
const express = require('express');
const cookieParser = require("cookie-parser");
const bodyParser = require("body-parser");
const webServerConfig = require('../config/web-server.js')
const moment = require('moment-timezone');
const path = require('path');
// const logger = require('morgan');
// const helper = require('../helper/helper')
// const cors = require('cors')

const routes = require('../routes/routes_main.js')

let httpServer;

function initialize() {
    return new Promise((resolve, reject) => {
        const app = express();
        httpServer = http.createServer(app);
        global.env = 'production'

        // // app.use(cors())
        // logger.token('date', () => {
        //     return moment().tz('Asia/Jakarta').format();
        // })

        // logger.token('user', () => {
        //     return "-";
        // })

        // app.use(logger(process.env.LOGS_FORMAT, {
        //     skip: function (req, res) { return res.statusCode == 304 }
        // }));

        // app.use(logger(process.env.LOGS_FORMAT, {
        //     stream: writer //fs.createWriteStream(path.join(__dirname, '../access.log'), { flags: 'a' })
        // }))


        // ==================== SETTING THE PAYLOAD MAX SIZE =====================
        
        app.use(express.json({ limit: '100mb' }));
        app.use(express.urlencoded({ limit: '100mb', extended: true }));        
        app.use(bodyParser.json({ limit: '100mb' }));
        app.use(bodyParser.urlencoded({ limit: '100mb', extended: true }));
        
        app.use(cookieParser());
        
        app.use(function (req, res, next) {
            res.append('Access-Control-Allow-Origin', ['*']);
            res.append('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
            res.append('Access-Control-Allow-Headers', 'Authorization, Origin, X-Requested-With, Content-Type, Accept, Access-Control-Request-Method');
            next();
        });
        
        // ======================================================================


        app.use('/api', routes)


        // ================ DEPLOYING IN ONE SAME NODE ================
        
        // app.use(express.static(path.join(__dirname, '..', 'web')));
        // app.get('*', (req, res) => {
        //     res.sendFile(path.join(__dirname, '..', 'web/index.html'));
        // });
        
        // ===========================================================

        
        httpServer.on('error', onError);
        httpServer.listen(webServerConfig.port, err => {
            if (err) {
                reject(err);
                return;
            }

            console.log(`Web server listening on localhost:${webServerConfig.port}`);
            resolve();
        });
    });
}

module.exports.initialize = initialize;

function close() {
    return new Promise((resolve, reject) => {
        httpServer.close((err) => {
            if (err) {
                reject(err);
                return;
            }

            resolve();
        });
    });
}

function onError(error) {
    if (error.syscall !== 'listen') {
        throw error;
    }

    var bind = typeof webServerConfig.port === 'string'
        ? 'Pipe ' + webServerConfig.port
        : 'Port ' + webServerConfig.port;

    // handle specific listen errors with friendly messages
    switch (error.code) {
        case 'EACCES':
            console.error(bind + ' requires elevated privileges');
            process.exit(1);
            break;
        case 'EADDRINUSE':
            console.error(bind + ' is already in use');
            process.exit(1);
            break;
        default:
            throw error;
    }
}

module.exports.close = close;

