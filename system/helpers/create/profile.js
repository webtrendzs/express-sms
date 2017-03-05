module.exports.create_profile = function (params, callback) {

    var name = params.name;
    var status = params.status;
    var group = params.group_id;
    var acl_index = params.acl_index;
    var p_items = [];

    var permissions = require(__dirname + '/../../auth/permission_store.js').all();
    //load permissions

    for (var i = 0; i < permissions.length; i++) {
        var val = permissions[i].value;
        if (params[val]) {
            p_items.push(val);
        }
    }

    sequelize.transaction(function (t) {

        return Profile.create({
            space: params.space,
            acl_index: acl_index,
            prof_name: name,
            status_id: status,
            group_id: group
        }, {transaction: t}).then(function (p) {

            var prof_id = p.prof_id;

            var p_records = [];

            for (var x = 0; x < p_items.length; x++) {
                p_records.push({profile_id: prof_id, name: p_items[x]});
            }

            return ProfilePermission.destroy({where: {profile_id: prof_id}}, {transaction: t}).then(function () {

                return ProfilePermission.bulkCreate(p_records, {transaction: t}).then(function (p) {
                    return p;
                });
            });

        });

    }).catch(function (error) {

        Utils.log(error);

        callback({msg:'profile couldnot be created'}, false);

    }).then(function (res) {

        callback(null, res);
    });
};