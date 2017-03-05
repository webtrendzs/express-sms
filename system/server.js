var express = require('express')
    , http = require('http')
    , https = require('https')
    , path = require('path')
    , flash = require('connect-flash')
    , fs = require('fs')
    , i18n = require("i18n")
    , cookie = require('cookie')
    , passport = require('passport')
    , redis= require('redis')
    , multer= require('multer')
    , bodyParser  = require("body-parser")
    , RedisStore = require('connect-redis')(express)
    , expressValidator = require('express-validator');


module.exports.create=function(){

    i18n.configure(Config.get('i18n'));

    var _app = express();

    //redis
    var redisClient = redis.createClient(
        Config.get('redis').port,
        Config.get('redis').host,
        Config.get('redis').options
    );

    global.redisClient=redisClient;

    _app.configure(function () {

        _app.set('views', __dirname + '/../'+ Config.get('viewsDir'));
        _app.set('view engine', 'jade');
        _app.use(express.static(__dirname + '/../'+ Config.get('assetsDir') , { maxAge: 86400000 }));
        _app.use(express.cookieParser(Config.get('secretStr')));
        _app.use(i18n.init);
        _app.use(express.bodyParser());
        _app.use(multer({ dest: __dirname + '/../'+ Config.get('uploadDir')}));
        _app.use(express.session({
            secret: '1D2K3ss2f53f322k5d9E9F5K2K8D',
            cookie: {
                path: '/',
                httpOnly: true,
                secure: false,
                maxAge: 86400 * 1000
            },
            rolling: true,
            store: new RedisStore(
                {
                    host: '127.0.0.1',
                    port: 6379,
                    client: redisClient,
                    no_ready_check: true,
                    db: 3,
                    prefix: "mticket_sess:"
                }
            )
        }));

        _app.use(passport.initialize());
        _app.use(passport.session());
        _app.use(flash());

        _app.use(function (req, res, next) {

            var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

            Utils.log(ip);

            if(req.session) {

                req.session._garbage = new Date();

                req.session.touch();

            }

            var req_lang=req.headers["accept-language"] || 'en_US';

            var language = req_lang.substring(0, 2);

            if (req.user)
                language = req.getLocale();

            req.setLocale(language);

            res.cookie('locale', language);
            next();
        });

        _app.use(expressValidator({
            customValidators: {
                isAlphanumeric: function (value) {
                    if (!value)
                        return false;
                    var regularExpression = /^(?=.*[0-9])(?=.*[a-z])([a-zA-Z0-9!@#$%^&*]{6,})$/;
                    return value.match(regularExpression);
                },
                gt: function (param, num) {
                    return param > num;
                }
            }
        }));

        _app.use(express.methodOverride());
        _app.use(_app.router);

        _app.use(function (req, res, next) {

            res.locals.session = req.session;
            res.locals.date = new Date();
            if (req.user)
                res.locals.user = req.user;
            next();
        });
    });

    _app.configure('development', function () {

        _app.use(express.errorHandler());

    });

    _app.set('passport',passport);
    _app.set('passport',passport);

    //authentication
    require(__dirname + '/auth/Authenticator.js').authenticator(passport);

    global.i18n = i18n;

    var auth = require(__dirname + '/auth/auth.js').auth();

    _app.use(auth.middleware());

    //register all controllers //TODO think of how to move this to globals
    fs.readdirSync(__dirname + '/controllers').forEach(function (file) {
        if (file.substr(-3) == '.js') {
            route = require(__dirname + '/controllers/' + file);
            route.controller(_app);
        }
    });

    _app.use(function (req, res, next) {

        res.status(404);

        if (req.accepts('html')) {

            res.render('error_404',
                {
                    title: 'SMS Company  | 404',
                    message: 'The page you are looking for is not found on this server',
                    error: "Page not found",
                    code: 404
                });
            return;
        }

        if (req.accepts('json')) {
            res.send({error: 'Not found'});
            return;
        }

        res.type('txt').send('Not found');
    });

    var server;

    if(Config.get('useHttps')){

        https.globalAgent.maxSockets = 100;

        server = https.createServer({

            key: require('fs').readFileSync(__dirname + '/config/ssl/server.key'),
            passphrase: 'passphrase',
            cert: require('fs').readFileSync(__dirname + '/config/ssl/server.crt')

        },_app);

    }else{

        http.globalAgent.maxSockets = 100;

        server = http.createServer(_app);

    }

    server.listen(Config.get('port'), function () {

        console.log("Express server listening on port " + Config.get('port'));
    });

};
