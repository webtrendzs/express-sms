module.exports.create_group = function (params, callback) {

    var name = params.name;

    sequelize.transaction(function (t) {

        return UserGroups.create({name: name}, {transaction: t}).then(function (p) {
            return p;
        });

    }).catch(function (error) {

        callback(error, false);

    }).then(function (res) {

        callback(null, res);

    });
};