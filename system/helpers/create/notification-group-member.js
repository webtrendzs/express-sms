module.exports.create = function (groupid, params, callback) {

    sequelize.transaction(function (t) {

        return NotificationGroupMember.create({
            group_id: groupid,
            name: params.name,
            phone: params.phone
        }, {transaction: t})
            .catch(function (error) {
                callback(error, false);
            }).then(function (res) {
                callback(null, res);
            });
    });
};