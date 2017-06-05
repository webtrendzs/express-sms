exports.uploadFile = function (req, callback) {
    var path = require('path');
    var fs = require('fs');
    var _file = req.file;
    var old_path = _file.path;
    var new_name = req.params.groupid+ '-' + _file.originalname;
    var new_path = __dirname + '/../../uploads/' + new_name;
    fs.readFile(old_path, function (err, data) {
        fs.writeFile(new_path, data, function (err) {
            MessageTemplateService.saveTemplateAttributes(req.params, new_path).then(function (_data) {
                fs.unlink(old_path, function (err) {
                    if (err) {
                        callback(err, null);
                    } else {
                        callback(null, true);
                    }
                });
            }).catch(function (error) {
                callback(error, null);
            });
        });
    });
};