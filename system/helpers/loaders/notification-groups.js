module.exports.load = function(config, callback) {
	
	var where = {};
	
	if(config.filters)
		for (var p in config.filters) {
			if (config.filters.hasOwnProperty(p)) {
				where[p] = config.filters[p];
			}
		}
	
	var sql = "select g.id, g.name,g.country, (select count(attribute_id) from tbl_message_template_attribute_values av " +
		"where av.attribute_id in (select id from tbl_message_template_attributes where group_id =g.id) group by attribute_id limit 1) as template_count, count(m.id) as manual_count from tbl_notificationgroups g left join tbl_notificationgroupmembers m on g.id = m.group_id {where2} group by g.id";

	var whr2 = 'where g.account_id ='+ where.account_id;
	
	if(where.id) {
		whr2 += ' and g.id=' + where.id;
	}
  
	sql = sql.replace('{where2}', whr2);
	
	sequelize.query(sql, {type: Sequelize.QueryTypes.SELECT}).then(function(results) {
		callback(null, {
			rows: results,
			total: results.length,
			offset: 0,
			limit: results.length
		});
	});
};