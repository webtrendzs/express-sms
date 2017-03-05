module.exports.load = function(config, callback) {
	
	if (config.filters && config.filters.profile_id == null) {
		load_from_db(config, false, callback);
	} else {
		
		if(!config.load_from_db) {
			
			redisClient.get("sms_permissions:" + config.filters.profile_id, function (err, obj) {
			    if(obj) {
			    	callback(null, JSON.parse(obj));
			    } else {
			    	load_from_db(config, true, callback);
			    }
			});
			
		} else {
			load_from_db(config, true, callback);
		}
		
		
	}
};

var serialize_to_redis = function(id,  obj) {

	redisClient.set("sms_permissions:" + id, JSON.stringify(obj));
};

var load_from_db = function(config, save, callback) {

	var attributes = ['per_id', 'profile_id', 'name'];

	var where = {};
	
	if(config.filters)
		for (var p in config.filters) {
			if (config.filters.hasOwnProperty(p)) {
				where[p] = config.filters[p];
			}
		}
	
	ProfilePermission.findAll({
			attributes: attributes,
			where: where,
			offset: 0, 
			limit: 1000,
			order: "per_id DESC"
		}).then(function(results) {
			var obj = {
				rows: results,
				total: results.length,
				offset: 0,
				limit: results.length
			};
			
			if(save)
				serialize_to_redis(config.filters.profile_id, obj);
			callback(null, obj);
		});
};