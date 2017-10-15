'use strict';

const express = require('express');
const handlers = require('./handlers');
const bodyParser = require('body-parser');

const app = express()

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.get('/', handlers.getHandler);
app.post('/', handlers.postHandler);

app.listen(3000, function () {
    console.log('Doodles app listening on port 3000!')
});
