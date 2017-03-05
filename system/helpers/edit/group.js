module.exports.edit_group = function (id, params, callback) {

    var name = params.name;

    sequelize.transaction(function (t) {

        return UserGroups.find({where: {group_id: id}}, {transaction: t}).then(function (row) {

            return row.updateAttributes({name: name}, {transaction: t}).then(function (p) {
                return p;
            });

        });

    }).catch(function (error) {

        callback(error, false);

    }).then(function (res) {

        callback(null, res);

    });
};