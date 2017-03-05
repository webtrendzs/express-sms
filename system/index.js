var cluster = require('cluster')
    , numCPUs = require('os').cpus().length
    , App = require('./helpers/initialize')
    , server = require('./server');

exports.start = function (options, callback) {

    var app = new App();

    var _this=this;

    app.on('initialize', function () {

        if (cluster.isMaster) {
            // Fork workers.
            for (var i = 0; i < numCPUs; i++) {
                //assign cron job processes to one worker only
                if(i==0 && !Config.get('disableCron'))
                    app.executeCronJobs();

                cluster.fork();
            }

            cluster.on('exit', function (worker, code, signal) {

                cluster.fork();

            });

        } else {

            server.create();
        }

    });

    app.init(options);



};