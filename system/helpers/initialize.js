var EventEmitter = require('events').EventEmitter,
    inherits = require('util').inherits,
    async = require('async'),
    fs = require('fs'),
    globals = require('./globals');


var App = module.exports = function () {

    if (!(this instanceof App))
        return new App();

    this.options = {};
};

inherits(App, EventEmitter);

App.prototype.init = function (options) {

    var _this = this;

    if (typeof options !== 'object')
        options = {};

    async.series([
            function (callback) {

                globals.register();

                callback(null, 'services registered');
            },
            function (callback) {

                _this.emit('initialize');

                callback(null, 'initialize event emitted');
            }
        ],
        function (err, results) {

        });

};

App.prototype.executeCronJobs = function () {

    if (Config.get('crons')) {

        var cron = require('cron').CronJob
            , jobs = Config.get('crons', true);

        //queue all jobs
        var q = async.queue(function (job, callback) {

            if (jobs.indexOf(job) != -1 && job.active){

                Utils.log(job.cronName+ ' queued successfully');

                require(__dirname + '/../crons/' + job.cronName + '.js').run(cron,job.options);
            }


            callback();

        }, 1);

        q.drain = function () {
            Utils.log("All cron jobs queued successfully")
        };

        q.push(jobs, function (err) {

            if(err)
                Utils.log(err);
        });
    }

};