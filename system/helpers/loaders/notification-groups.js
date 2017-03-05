module.exports.load = function(config, callback) {
	
	var where = {};
	
	if(config.filters)
		for (var p in config.filters) {
			if (config.filters.hasOwnProperty(p)) {
				where[p] = config.filters[p];
			}
		}
	
	var sql = "select g.id, g.name,g.country, count(m.id) as no_of_members from tbl_notificationgroups g left join tbl_notificationgroupmembers m on g.id = m.group_id {where} group by g.id";

	var whr = '';
	
	if(where.id)
		whr = 'where g.id=' + where.id;
	
	sql = sql.replace('{where}', whr);
	
	sequelize.query(sql, {type: Sequelize.QueryTypes.SELECT}).then(function(results) {
		callback(null, {
			rows: results,
			total: results.length,
			offset: 0,
			limit: results.length
		});
	});
};