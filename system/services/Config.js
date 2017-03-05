function search(obj, key) {

    if (_.has(obj, key))
        return obj[key];

    return _.flatten(_.map(obj, function(v) {
        return typeof v == "object" ? search(v, key) : [];
    }), true);
}

exports.defaults = function(config) {

    var env=process.env.NODE_ENV || 'development';

    var d_config=require('../config/default');

    _.extend(d_config,config);

    var _config = require(__dirname + '/../config/'+env+'.js').config(d_config);

    return _config;

};
//defaults only
exports.with = function(config) {

    var d_config=require('../config/default');

    _.extend(d_config,config);

    return d_config;

};

exports.get=function(key,asArray){

    var _config = this.defaults({});

    var item=search(_config,key);

    return _.isArray(item) && !asArray ? item[0] : item;
};