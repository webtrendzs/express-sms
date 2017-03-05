var _ = require('lodash');
var pdf = require('html-pdf');
var Utils = require(__dirname + '/Utils.js');
var tree = require(__dirname + '/../helpers/menu/_tree.js');
var path = require('path');
var mime = require('mime');
var fs = require('fs');
var _this = this;

exports.disposeToBrowser = function (res, file, format) {

    var filename = path.basename(file);

    var mimetype = mime.lookup(file);

    var today = new Date().toISOString().slice(0, 10);

    filename = filename.substring(0, filename.indexOf('_')) + " - " + today + "." + format;

    res.setHeader('Content-disposition', 'attachment; filename=' + filename);

    res.setHeader('Content-type', mimetype);

    var filestream = fs.createReadStream(file);

    filestream.pipe(res);

};

exports.toPDF = function (req, res, html) {

    pdf.create(html, Config.get('pdf')).toStream(function (err, stream) {

        var file = Config.get('tmpFolder') + req.query.title + req.query.invoice_num + "_" + new Date().getTime() + ".pdf";

        writableStream = fs.createWriteStream(file);

        writableStream.on("finish", function () {

            _this.disposeToBrowser(res, file, 'pdf');

        });

        stream.pipe(writableStream);

    });
};

exports.toCSV = function (req, res, data) {

    var csv = require('fast-csv');

    var report_name = '/' + Config.get('space') + '/report/' + req.report_name;

    var name = tree.get_item_name(report_name);

    if(name==undefined) return;

    name = name.toUpperCase();

    var today = new Date().toISOString().slice(0, 10);

    var file = Config.get('tmpFolder') + name + "_" + new Date().getTime() + ".csv";

    var csvStream = csv.createWriteStream({headers: true}),
        writableStream = fs.createWriteStream(file);

    csvStream.pipe(writableStream);

    var columns = data.columns;

    for (var i = 0; i < data.rows.length; i++) {

        var row = data.rows[i];

        var csvrow = {};

        for (var c = 0; c < columns.length; c++) {
            var col = columns[c];
            csvrow[col.label] = row[col.name];
        }

        csvStream.write(csvrow);
    }

    csvStream.end();

    writableStream.on("finish", function () {

        if(res!==false)
            _this.disposeToBrowser(res, file, 'csv');

    });
};

exports.toXLS = function (req, res, data) {

    var report_name = '/' + Config.get('space') + '/report/' + req.report_name;

    var name = tree.get_item_name(report_name);

    if(name==undefined) return;

    name = name.toUpperCase();

    var xlsx = require('node-xlsx');

    var content = [
        [name]
    ];

    var xrow = [];
    var columns = data.columns;

    for (var c = 0; c < columns.length; c++) {

        var col = columns[c];


        xrow.push({
            value: col.label + "",
            formatCode: "General"
        });

    }

    content.push(xrow);

    for (var i = 0; i < data.rows.length; i++) {

        var row = data.rows[i];

        xrow = [];

        for (var c = 0; c < columns.length; c++) {
            var col = columns[c];
            var val = row[col.name] == null ? '' : row[col.name];

            xrow.push({
                value: val + "",
                formatCode: "General"
            });
        }

        content.push(xrow);
    }

    var buffer = xlsx.build({
        worksheets: [
            {"name": name, "data": content}
        ]
    });

    var fs = require('fs');

    var today = new Date().toISOString().slice(0, 10);

    var file = Config.get('tmpFolder') + (res===false ? "/daily_reports/downloads/" : "") + name + (res===false ? "-" + today : "_" + today) + ".xlsx";

    fs.writeFile(file, buffer, function (data) {

        if(res!==false)
            _this.disposeToBrowser(res, file, 'xlsx');

    });
};