var Sequelize = require("sequelize");

module.exports.edit = function(app, id, params, space, callback) {
	
	var seq = app.get('sequelize');
	
	var name = params.name;
	var status = params.status;
	
	var NotificationGroup = require(__dirname + '/../../models/NotificationGroup.js').model(Sequelize, seq);
	
	seq.transaction(function(t) {
		
		return NotificationGroup.find({where: {id: id} }, {transaction: t}).then(function(row) {
			return row.updateAttributes({ name: name, status: 1,country: params.country }, { transaction: t });
		}).fail(function (error) {
            t.rollback().success(function () {
            	callback(error, false);
            });
        }).success(function(res) {
        	t.commit().success(function(){
        		update_redis_permissions(app, id);
        		callback(null, res);
        	});
        });
		
	});
};

var update_redis_permissions = function(app, id) {

	var loader = require(__dirname + '/../DBFactory.js');
	
	var config = require(__dirname + '/../config/default.js').config(app, {
		space: 'cci',
		name: 'profilepermissions',
		filters: {
			profile_id: id
		},
		load_from_db: true
	});
	
	loader.load(app, config, function(err, data) {
	});
};