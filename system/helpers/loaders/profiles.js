module.exports.load = function(config, callback) {

	var attributes = ['prof_id', 'prof_name','acl_index', 'status_id','group_id'];
	
	var where = {
		space: Config.get('app_name')
	};
	
	if(config.filters)
		for (var p in config.filters) {
			if (config.filters.hasOwnProperty(p)) {
				where[p] = config.filters[p];
			}
		}
	
	Profile
		.findAll({
			attributes: attributes,
			where: where,
			offset: 0, 
			limit: 1000,
			order: "acl_index DESC"
		}).then(function(results) {
			
			UserGroups.findAll().then(function(groups){
				var t=[];
				groups.forEach(function(val,i){
					t.push(val);
				});
				
				callback(null, {
					rows: results,
					total: results.length,
					offset: 0,
					groups:t,
					limit: results.length
				});
			});
			
		});
};