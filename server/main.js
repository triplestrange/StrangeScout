const express = require('express');
const vhost = require('vhost');
const PouchDB = require('pouchdb');
const path = require('path');
const https = require('https');
const compression = require('compression');
const fs = require('fs');

// winston for logging
const winston = require('winston');
const expressWinston = require('express-winston');

let globaldomain = '';
let globalhttps = true;

let httpscors = process.env.HTTPSCORS;

module.exports = function(domain, datadir, httponly, port, keypath, certpath) {
	// set some icky global variables (data is needed in other functions \/)
	globaldomain = domain;
	if (httponly) {
		globalhttps = false;
	}

	// if we're not running as root, throw an error about restricted ports
	if (process.getuid() !== 0) {
		if (!httponly) {
			console.error(`Ports 80 and 443 are restricted to root - \x1b[31myou are not root!\x1b[0m\nTry running with sudo?`);
			process.exit(1);
		} else if (port < 1024) {
			console.error(`Port ${port} is restricted to root - \x1b[31myou are not root!\x1b[0m\nTry running with sudo?`);
			process.exit(1);
		}
	}
	
	// create db data path if it doesn't exist
	if (!fs.existsSync(datadir)) {
		fs.mkdirSync(datadir);
	}
	// change to directory
	process.chdir(datadir);

	// set DB options
	const dbopts = {prefix: `${datadir}/`};
	// define database
	const db = PouchDB.defaults(dbopts);

	let serveropts = {};
	if (!httponly) {
		// read TLS key from file
		let key = '';
		if (fs.existsSync(keypath)) {
			key = fs.readFileSync(keypath);
		} else {
			console.error(`\x1b[31mERROR:\x1b[0m No key file at \`${keypath}\`!`);
			process.exit(1);
		}
		
		// read TLS certificate from file
		let cert = '';
		if (fs.existsSync(certpath)) {
			cert = fs.readFileSync(certpath);
		} else {
			console.error(`\x1b[31mERROR:\x1b[0m No certificate file at \`${certpath}\`!`);
			process.exit(1);
		}

		// set key options
		serveropts = {
			// Private key
			key: key,
			// Fullchain file or cert file (prefer the former)
			cert: cert
		};
	}

	// define app
	const app = express();
	// logging (https://github.com/bithavoc/express-winston#request-logging)
	app.use(expressWinston.logger({
		transports: [
			new winston.transports.Console()
		],
		format: winston.format.combine(
			winston.format.json()
		),
		meta: false,
		msg: "HTTP {{req.method}} {{req.url}} {{req.method}} {{res.responseTime}}ms",
		expressFormat: false
	}));

	// use compression
	app.use(compression());

	// static files
	const static = express();
	static.use(express.static(path.join(__dirname, 'static')));
	// pouchdb
	const pouch = express();
	pouch.use(cors);
	pouch.use(noCache);
	pouch.use(require('express-pouchdb')(db));

	app.use(vhost(`${domain}`, static));
	app.use(vhost(`db.${domain}`, pouch));

	console.log(`Hosting StrangeScout on ${domain}`);

	if (!httponly) {
		// server
		https
		.createServer(serveropts, app)
		.listen(443, () => {
			console.log(`listening on port ${443}`);
		}).on('error', (err) => {
			console.log(err);
		});

		express().get('*', function(req, res) {
			console.log('redirecting HTTP to HTTPS');
			res.redirect('https://' + req.headers.host + req.url);
		})
		.listen(80);
	} else {
		app.listen(port, () => {
			console.log(`listening on port ${port}`);
		}).on('error', (err) => {
			console.log(err);
		});
	}

}

// HEADERS -----------------------------

// CORS Headers
function cors(req, res, next) {
	if (globalhttps || httpscors === 'true') {
		res.set("Access-Control-Allow-Origin", `https://${globaldomain}`);
	} else {
		res.set("Access-Control-Allow-Origin", `http://${globaldomain}`);
	}
	res.set("Access-Control-Allow-Headers", "Content-Type,X-Requested-With");
	res.set("Access-Control-Allow-Credentials", "true");
	res.set("Access-Control-Allow-Methods","PUT,POST,GET,DELETE,OPTIONS");
	if (req.method === 'OPTIONS') {
		res.send(200);
	} else {
		next();
	}
}

// Caching Headers
function noCache(req, res, next) {
	res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
	res.header('Expires', '-1');
	res.header('Pragma', 'no-cache');
	next();
}
