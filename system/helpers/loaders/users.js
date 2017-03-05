module.exports.load = function (config, callback) {

    var limit = 100;
    var page = 1;
    var user = config.user;
    var space = Config.get('app_name');

    var p_config = config.pagination;
    if (p_config) {
        limit = p_config.limit;
        page = p_config.page;

        if (page <= 0)
            page = 1;
    }

    var start = (page * limit) - limit;
    var where = [], is_escalate = false;

    if (config.filters) {

        for (var p in config.filters) {
            if (config.filters.hasOwnProperty(p)) {
                where.push(p + "='" + config.filters[p] + "'");
            }
        }
    }

    if (config.params) {
        if (config.params.name) {
            where.push('userfullname ilike \'%' + config.params.name + '%\'');
        }

        if (config.params.username) {
            where.push('username ilike \'%' + config.params.username + '%\'');
        }
    }

    load_profile(user.prof_id, function (err, profile) {

        var _profile = profile.rows[0];
        var _where = (_profile.group_id == 1 ? '' : ' AND p.group_id=' + _profile.group_id);

        var _sql = 'SELECT user_id' +
            ', user_lang' +
            ', userfullname' +
            ', (select name from tblusergroups where group_id=p.group_id) as groupname' +
            ', (prof_name || \' [ \' || (select name from tblusergroups where group_id=p.group_id) || \' ]\') as profile' +
            ', group_id' +
            ', username' +
            ', useremail' +
            ', userphone' +
            ', u.status_id' +
            ', u.prof_id' +
            ', adp_id ' +
            'FROM sysusers u left join tblprofiles p on cast(u.prof_id as integer)=p.prof_id ' +
            'WHERE (' + (where.length > 0 ? where.join(' AND ') + ' AND ' : '' ) + 'u.prof_id IS NOT NULL AND p.space=\'' + space + '\'  ' + _where + ')  ORDER BY u.user_id DESC';


        sequelize.query('SELECT count(*) FROM (' + _sql + ') as count', {type: Sequelize.QueryTypes.SELECT}).then(function (counter) {

            if (!isNaN(start))
                _sql += ' LIMIT ' + limit + ' OFFSET ' + start;

            sequelize.query(_sql, {type: Sequelize.QueryTypes.SELECT}).then(function (users) {

                callback(null, {
                    rows: users,
                    total: counter[0].count,
                    offset: start,
                    limit: limit,
                    page: page
                });

            });

        });

    });


};

var load_profile = function (prof_id, callback) {

    var config = Config.defaults({
        name: 'profiles',
        filters: {
            prof_id: prof_id
        }
    });

    Loader.load(config, function (err, data) {
        callback(err, data);
    });
};
