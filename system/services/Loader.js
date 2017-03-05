exports.load = function (config, callback) {

    var loader = (function (_config) {

        var loader_name = _config.loader ? _config.loader : _config.name;

        return require(__dirname + '/../helpers/loaders/' + loader_name + '.js');

    })(config);

    loader.load(config, function (err, res) {

        callback(err, res);

    });

};
