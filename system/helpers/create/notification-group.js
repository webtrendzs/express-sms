module.exports.create = function (params, callback) {

    var name = params.name;

    sequelize.transaction(function (t) {
        return NotificationGroup.create({account_id: params.account_id, name: name, status: 1, country: params.country}, {transaction: t})
            .catch(function (error) {
                callback(error, false);
            }).then(function (res) {
                callback(null, res);
            });
    });
};