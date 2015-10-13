var express = require("express");
var favicon = require('serve-favicon');
var body_parser = require("body-parser");
var mongoose = require("mongoose");
var config = require('./_config');

var app = express();

mongoose.connect(config.mongo_uri[app.settings.env], function(err, res) {
    if(err) {
        console.log('Error connecting to the database. ' + err);
    } else {
        console.log('Connected to Database: ' + config.mongo_uri[app.settings.env]);
    }
});

var users = require('../routes/users');


var router = express.Router();

app.use(favicon(__dirname + '/../public/images/favicon.ico'));
app.use(body_parser.json());
app.use(body_parser.urlencoded({"extended": false}));

app.use('/users', users);

app.use('/', router);

module.exports = app;
