module.exports.edit = function (id, params, callback) {

    var oldpass = Utils.encryptPassword(params.current_password);
    var userpass = Utils.encryptPassword(params.new_password);

    var data = null;

    sequelize.transaction(function (t) {

        return User.find({where: {user_id: id}}, {transaction: t}).then(function (row) {

            data = row;

            if (oldpass === row.userpass) {

                return row.updateAttributes({
                    userpass: userpass
                }, {transaction: t}).then(function (p) {

                    return p;

                });

            }else
                return false;

        });

    }).catch(function (error) {

        callback(error, false);

    }).then(function (res) {

        if (res)
            callback(null, {status: 'success'});
        else {
            callback([{
                    param: 'current_password',
                    msg: 'Wrong current password',
                    value: ''
            }], false);
        }
    });
};