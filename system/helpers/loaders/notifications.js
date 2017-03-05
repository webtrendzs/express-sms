module.exports.load = function(config, callback) {

    var where = {};

    if(config.filters)
        for (var p in config.filters) {
            if (config.filters.hasOwnProperty(p)) {
                where[p] = config.filters[p];
            }
        }

    var sql = "select id,(select name from tbl_notificationgroups where id = groupid limit 1) as member_group,message, (case when approved = 'True' then 'Approved' else 'Not Approved' end) as status from tbl_group_notifications {where}";

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