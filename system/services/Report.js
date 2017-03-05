var dateFormat = require('dateformat');
var _ = require('lodash');
var Utils = require('./Utils.js');
var fs = require('fs');

exports.render = function (name, req, callback) {

    var Report = require('../helpers/reports/_index.js');

    var reports = [];

    fs.readdirSync(__dirname + '/../helpers/reports').forEach(function (file) {

        reports.push(file.substr(0, file.indexOf('.')));
    });

    if (reports.indexOf(name) == -1)
        return Utils.log('Report ' + name + '.js was not found in ' + __dirname + '/../helpers/reports');

    var config = require('../helpers/reports/' + name + '.js');

    _.extend(config, {

        pagination: {
            paginate: req.query.format? false : true,
            page: req.query.page || 1,
            offset: req.query.pageSize || Config.get('pagination').limit,
            limit: Config.get('pagination').limit
        },
        name: name,
        user: req.user ? req.user : {},
        request_filters: {}

    });

    if(req.body)
        _.extend(req.query,{request_filters: _.merge(req.body,req.query)});

    _.merge(config, req.query);

    var _report = new Report(config);

    _report.generate(function (err, data) {

        return callback(err, data);

    });

};

exports.download = function (name, req, res, format, callback) {

    var _to = 'to' + format.toUpperCase();
    var _this = this;

    return this.render(name, req, function (err, data) {

        if (!err) {

            Downloads[_to].call(_this, req, res, data);

            callback(null, true);

        } else {
            callback(err, null);
        }


    });
};

exports.getExportUrl = function (req, space, name) {

    var _urlStr = "?";

    if (req.body) {

        var params=req.body;

        for (var param in params) {

            if (params[param].length > 0) {
                var filter = param + "=" + params[param];
                _urlStr += _.endsWith(_urlStr, "?") ? filter : "&" + filter;
            }
        }

        _urlStr += _.endsWith(_urlStr, "?") ? "format=" : "&" + "format=";
    }
    return '/' + space + '/report/export/' + name + _urlStr;
};
