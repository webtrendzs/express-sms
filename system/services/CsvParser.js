exports.parse = function(inputFile){
    var fs = require('fs');
    var parse = require('csv-parse');
    var async = require('async');

    var parser = parse({delimiter: ','}, function (err, data) {
        async.eachSeries(data, function (line, callback) {
            // do something with the line
            callback();
        })
    });

    fs.createReadStream(inputFile).pipe(parser);
};