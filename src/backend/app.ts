
import express = require('express');
import fs = require('fs');
import http = require('http');
import path = require('path');
import mongoose = require('mongoose');
import passport = require("passport");
import flash = require("connect-flash");
import cookieParser = require('cookie-parser');
import bodyParser = require('body-parser');
import session = require('express-session');
import MongoStore = require('connect-mongo');
import swig = require("swig");
import expressCompression = require('compression');
import cons = require('consolidate');
import tickerRunner = require('./modules/TickerRunner');
import ticker = require('./modules/Ticker');
import config = require('./config/config');
import exec = require('./modules/StrategyExecutor');

import logginStrat = require('./strategies/LogginStrategy');
import customStrat = require('./strategies/CustomBuyLowSellHigh');
import simpleportfolio = require('./modules/SimplePortfolio');
import btceportfolio = require('./modules/BTCEPortfolio');


var env     = process.env.NODE_ENV || 'development';
var port    = process.env.PORT || 8089;
mongoose.connect(config.db);
var app = express();

//var portfolio = new btceportfolio.BTCEPortfolio('ltc_usd','ZNZXDFMA-RAR0GVMN-AKCGHMOY-24IYSSIL-O1O7S613','471c44dff8206b8d35e172977ff958ee9af1b77e22c5a6c792dcfd376cba8cd6');
var portfolio = new simpleportfolio.SimplePortfolio('ltc_usd',1000,0,0.002);

var runner = new tickerRunner.TickerRunner('ltc_usd', 60,false);
var executor = new exec.StrategyExecutor('ltc_usd', 60,
    //new customStrat.CustomBuyLowSellHigh(),
    new logginStrat.LogginStrategy(),
    portfolio
    );


portfolio.init().then(()=>{
    runner.registerHandler((t : ticker.Tick)=>{
        executor.handleTick(t);
    });
});

var server = http.createServer(app);



var io = require('socket.io').listen(server);
io.set('log level', 1);//reduce logging

app.set('views', __dirname + '/views');
app.engine('html', cons.swig);
app.set('view engine', 'html');
app.use(expressCompression());
app.use(cookieParser()); // read cookies (needed for auth)
app.use(bodyParser.json()); // get information from html forms
app.use(bodyParser.urlencoded({ extended: true }));


// required for passport
app.use(session({ secret: 'ilovewebdevelopmentandiamcrazyabouttechnology' })); // session secret
app.use(passport.initialize());
app.use(passport.session()); // persistent login sessions
app.use(flash()); // use connect-flash for flash messages stored in session
app.use(express.static(path.join(__dirname, 'public')));


app.use(<ErrorRequestHandler>(err, req, res, next) => {
    res.status(err.status || 500);
    res.render('500', {error: err});
});

app.use(function (req, res, next) {
    res.status(404);
    if (req.accepts('html')) {
        res.render('404', {url: req.url});
        return;
    }
    if (req.accepts('json')) {
        res.send({error: 'Not found'});
        return;
    }
    res.type('txt').send('Not found');
});

process.on('uncaughtException', function (err) {
    // handle the error safely
    console.log(err);
    process.exit(1);
});

server.listen(port, function () {
    console.log("Express server listening on port " + port);
});

