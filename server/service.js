#!/usr/bin/env node

const path = require('path');
const server = require('./main');

const configfile = path.join(process.env.SNAP_COMMON, 'service.conf.json')
const config = require(configfile);

const key = path.join(process.env.SNAP_COMMON, 'server.key');
const cert = path.join(process.env.SNAP_COMMON, 'server.cert');

server(config.domain, config.port, key, cert, path.join(process.env.SNAP_COMMON, 'dbs/'))