exports.run=function(cron,options){

    var job = new cron(_.extend({
        onTick: function () {

            var today = new Date();

            Utils.log(today);

        }
    },options));

    job.start();

};