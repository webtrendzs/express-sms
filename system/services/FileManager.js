exports.uploadFile = function (req, inputName, callback) {
    var path = require('path');
    var fs = require('fs');
    var _file = req.files[inputName];
    var old_path = _file.path,
        index = old_path.lastIndexOf('/') + 1,
        new_path = __dirname + '/../../uploads/' + _file.name;

    fs.readFile(old_path, function (err, data) {
        fs.writeFile(new_path, data, function (err) {
            fs.unlink(old_path, function (err) {
                if (err) {
                    callback(err, null);
                } else {
                    callback(null, true);
                }
            });
        });
    });
};