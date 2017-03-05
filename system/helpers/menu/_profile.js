module.exports = (function () {

    var mark_selected_profiles = function (pp) {

        var permissions = require(__dirname + '/../../auth/permission_store.js').all();

        for (var i = 0; i < permissions.length; i++) {
            var p_row = permissions[i];

            for (var x = 0; x < pp.rows.length; x++) {

                if (p_row.value === pp.rows[x].name) {
                    p_row.checked = true;
                }
            }
        }

        return permissions;
    };

    var load_profile = function (options, callback) {

        var config = Config.with({
            name: 'profiles',
            filters: {
                prof_id: options.id
            }
        });

        Loader.load(config, function (err, data) {

            callback(null, data);
        });

    };

    var load_user_group = function (req, callback) {

        var filters = {
            prof_id: req.user.prof_id
        };

        var config = Config.with({
            name: 'profiles',
            filters: filters
        });

        Loader.load(config, function (err, data) {

            var group_id = data.rows[0].group_id;

            Loader.load({
                name: 'groups',
                filters: {group_id: group_id}
            }, function (error, group) {

                callback(err, group.rows[0]);
            });
        });
    };

    var load_groups = function (options, callback) {

        var config = Config.with(_.extend({
            name: 'groups'
        }, options));

        Loader.load(config, callback);
    };

    var delete_profile = function (prof_id, callback) {

        var where = 'where prof_id=' + prof_id + ' and space=\'' + Config.get('app_name') + '\'';

        sequelize.query('delete from tblprofiles ' + where, {type: Sequelize.QueryTypes.DELETE}).then(function (data) {

            sequelize.query('delete from tblprofilepermissions where profile_id=' + prof_id, {type: Sequelize.QueryTypes.DELETE}).then(function (pdata) {
                callback(null, data);
            });

        }).catch(function (err) {
            callback(err, null);
        });
    };

    var load_profile_permissions = function (options, callback) {

        options = _.merge({name: 'profilepermissions'}, options);

        Loader.load(Config.with(options), function (err, data) {
            callback(err, data);
        });
    };

    var load_profiles = function (req, callback, is_active) {

        load_user_group(req, function (err, group) {

            var where = "where space='" + Config.get('app_name') + "'";

            if (group.group_id != 1) {
                where += ' and p.group_id=' + group.group_id
            }

            sequelize.query('select * from tblprofiles p inner join tblusergroups g on p.group_id=g.group_id ' + where, {type: sequelize.QueryTypes.SELECT}).then(function (data) {

                callback(null, data);
            }).catch(function (err) {

                callback(err, null);
            });
        });

    };

    return {
        mark: mark_selected_profiles,
        load: load_profile,
        groups: load_groups,
        delete: delete_profile,
        user_group: load_user_group,
        permissions: load_profile_permissions,
        all: load_profiles
    }

})();