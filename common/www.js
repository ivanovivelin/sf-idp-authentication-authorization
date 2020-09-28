#!/usr/bin/env node

/**
 * Module dependencies.
 */

import app from '../app.js';
import parseArgs from 'minimist';
import debugLib from 'debug';
import http from 'http';
import nconf from 'nconf';
import https from 'https';
import request from 'request-promise';


const debug = debugLib('your-project-name:server');

const args = process.argv.slice(2);
const argv = parseArgs(args);

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3005');
app.set('port', port);

/**
 * Create HTTP server.
 */

app.get('/', async (req, res) => {
    res.json({
        message: 'root',
    });
});

/**
 * OAuth 2.0 web server flow
 * Request an Authorization Code
 */
app.get('/login', async (req, res) => {
    res.redirect(`${nconf.get('SF_ORG_INSTANCE')}/services/oauth2/authorize?client_id=${nconf.get('SF_CONNECTED_APP_CLIENT_ID')}
    &redirect_uri=${nconf.get('SF_CALLBACK_URL')}&response_type=code`)
});

/**
 * OAuth 2.0 web server flow
 * Callback endpoint that requests an Access Token
 */
app.get('/oauthcallback', async (req, res) => {
    console.log(req.query.code);
    const authRequest = {
        method: "POST",
        uri: nconf.get("SF_ORG_AUTH_TOKEN_ENDPOINT"), // update for config val
        form: {
          grant_type: "authorization_code",
          code: req.query.code,
          client_id: nconf.get('SF_CONNECTED_APP_CLIENT_ID'),
          client_secret: nconf.get('SF_CONNECTED_APP_CLIENT_SECRET'),
          redirect_uri: 'http://localhost:3005/oauthcallback'
        },
    };
    const sfResponse = JSON.parse(await request(authRequest));
    console.log(sfResponse);
    res.json({
        access_token: sfResponse.access_token
    });
});

/**
 * SAML Callback
 * 
 */
app.get('/customer/login', async (req, res) => {
  //res.redirect(`https://dev2-btpocx.cs126.force.com/btcustomer/login`);
  res.redirect(`${nconf.get('SF_COMMUNINITY_INSTANCE')}/services/oauth2/authorize?client_id=${nconf.get('SF_CONNECTED_APP_CUSTOMER_CLIENT_ID')}
    &redirect_uri=${nconf.get('SF_CUSTOMER_CALLBACK_URL')}&response_type=code`)
});

app.get('/customer/oauthcallback', async (req, res) => {
  console.log(req.query.code);
  const authRequest = {
      method: "POST",
      uri: nconf.get("SF_ORG_AUTH_TOKEN_ENDPOINT"), // update for config val
      form: {
        grant_type: "authorization_code",
        code: req.query.code,
        client_id: nconf.get('SF_CONNECTED_APP_CUSTOMER_CLIENT_ID'),
        client_secret: nconf.get('SF_CONNECTED_APP_CUSTOMER_SECRET'),
        redirect_uri: 'http://localhost:3005/oauthcallback'
      },
  };
  const sfResponse = JSON.parse(await request(authRequest));
  console.log(sfResponse);
  res.json({
      access_token: sfResponse.access_token
  });
});


var server = http.createServer(app);

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
server.on('error', onError);
server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
  var port = parseInt(val, 10);

  if (isNaN(port)) {
    // named pipe
    return val;
  }

  if (port >= 0) {
    // port number
    return port;
  }

  return false;
}

 /**
  * @description Event listener for HTTP server "error" event.
  * @param {*} error 
  */

function onError(error) {
  if (error.syscall !== 'listen') {
    throw error;
  }

  var bind = typeof port === 'string' ? 'Pipe ' + port : 'Port ' + port;

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

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
  var addr = server.address();
  var bind = typeof addr === 'string' ? 'pipe ' + addr : 'port ' + addr.port;
  console.log(`Express Server Listening on ${bind}`);
  debug('Listening on ' + bind);
}


process.on('unhandledRejection', (err) => { 
  console.error(err)
  process.exit(1)
});