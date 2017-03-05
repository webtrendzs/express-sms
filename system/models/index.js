"use strict";

var fs = require("fs");
var path = require("path");
var db = {};

fs.readdirSync(__dirname).filter(function (file) {

    return (file.indexOf(".") !== 0) && (file !== "index.js");

}).forEach(function (file) {

    var model = sequelize["import"](path.join(__dirname, file));
    console.log(path.join(__dirname, file));
    //globally avail all models
    global[file.substr(0,file.indexOf('.'))] = require(__dirname + '/models/' + file).model(Sequelize, seq);


    db[model.name] = model;

});

Object.keys(db).forEach(function (modelName) {
    if ("associate" in db[modelName]) {
        db[modelName].associate(db);
    }
});

db.sequelize = sequelize;
db.Sequelize = Sequelize;

module.exports = db;
