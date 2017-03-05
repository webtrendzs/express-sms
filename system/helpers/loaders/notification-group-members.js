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
        callback(null, {
            rows: results,
            total: results.length,
            offset: 0,
            limit: results.length
        });
    }).catch(function (err) {
        callback(err, null);
    });
};