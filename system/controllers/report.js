module.exports.controller = function (app) {

    app.get("/:space/report/export/:name", Auth.is('IS_AUTHENTICATED'), function (req, res) {

        var format = req.query.format;

        var report_name = req.params.name;

        req['report_name'] = report_name;

        var options = {page: true};

        _.extend(req.query, options);

        Report.download(report_name, req, res, format, function (err, success) {

            Utils.log('--Report ' + report_name + ' downloaded');

        });

    });
};