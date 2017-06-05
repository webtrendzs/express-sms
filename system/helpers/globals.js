var fs = require('fs'),
    Sequelize = require('sequelize');

exports.register = function () {

    //avail lodash with priority and sequelize
    global._ = require('lodash');
    global.Sequelize=Sequelize;

    fs.readdirSync(__dirname + '/../services').forEach(function (file) {

        if (file.substr(-3) == '.js') {
            global[file.substr(0,file.indexOf('.'))] = require(__dirname + '/../services/' + file);
        }
    });

    global['Auth'] = require(__dirname + '/../auth/auth.js').auth();

    global.sequelize =(function(){

        return new Sequelize(Config.get('db').url,Config.get('db').options);

    })();

    //globally avail all models
    fs.readdirSync(__dirname + '/../models').filter(function (file) {

        return (file.indexOf(".") !== 0) && (file !== "index.js");

    }).forEach(function (file) {

        if (file.substr(-3) == '.js') {
            global[file.substr(0, file.indexOf('.'))] = require(__dirname + '/../models/' + file).model(Sequelize, sequelize);
        }
    });

    if(Config.get('db').options.forceSync)
        sequelize.sync();

};
