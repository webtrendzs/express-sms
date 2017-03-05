module.exports.load = function(config, callback) {
	
	var attributes = ['group_id', 'name'];	
	
	var where = {};
	
	if(config.filters)
		for (var p in config.filters) {
			if (config.filters.hasOwnProperty(p)) {
				where[p] = config.filters[p];
			}
		}
	
	UserGroups
		.findAll({
			attributes: attributes,
			where: where,
			offset: 0, 
			limit: 1000,
			order: "group_id DESC"
		}).then(function(results) {
			callback(null, {
				rows: results,
				total: results.length,
				offset: 0,
				limit: results.length
			});
		});
};