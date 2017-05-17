module.exports.load = function (config, callback) {

    var where = {};

    if (config.filters)
        for (var p in config.filters) {

            if (config.filters.hasOwnProperty(p)) {
                where[p] = config.filters[p];
            }
        }

    NotificationGroupMember.findAll({
        where: where,
        offset: 0,
        limit: 1000,
        order: "id DESC"
    }).then(function (results) {
        load_template_members(where, function(err, rows) {
            var items = [];
            var item_rows = _.groupBy(rows, 'attribute_name');
            _.each(item_rows, function(_rows, index) {
                items.push(_rows);
            });
            var template_members = _.keys(items[0]).map(function(c) {
                return items.map(function(r) { return r[c]; });
            });
            callback(null, {
                manual_members: results,
                template_members: template_members
            });
        });
    }).catch(function (err) {
        callback(err, null);
    });

    var load_template_members = function(where, callback){
        var sql = "select av.attribute_id, a.attribute_name, av.attribute_value from tbl_message_template_attributes a " +
            "inner join tbl_message_template_attribute_values av on a.id = av.attribute_id {where} order by av.id asc";

        var whr = '';

        if(where.group_id)
            whr = 'where av.group_id=' + where.group_id;

        sql = sql.replace('{where}', whr);

        sequelize.query(sql, {type: Sequelize.QueryTypes.SELECT}).then(function(results) {
            callback(null, results);
        });
    };
};