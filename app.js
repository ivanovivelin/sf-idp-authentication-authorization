"use strict";

import express from 'express';
import path from 'path';
import cookieParser from 'cookie-parser';
import logger from 'morgan';
import nconf from 'nconf';

const __dirname = path.resolve();

nconf.env([
    "SF_PROXY_APPLICATION_PORT",
    "SF_PROXY_PRIVATE_KEY_PATH",
    "SF_CONNECTED_APP_CLIENT_ID",,
    "SF_CONNECTED_APP_CLIENT_SECRET",
    "SF_CALLBACK_URL"
]);
nconf.defaults({ conf: `${__dirname}/config.json` });
nconf.file(nconf.get("conf"));

const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, '../public')));

export default app;
