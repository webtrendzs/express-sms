module.exports.create = function (params, callback) {

    sequelize.transaction(function (t) {

        var user = {
            userfullname: params.userfullname,
            username: params.username,
            useremail: params.useremail,
            userphone: params.userphone,
            status_id: params.status_id,
            userpass: Utils.encryptPassword(params.password),
            prof_id: params.prof_id,
            emp_id: params.emp_id,
            user_lang: params.user_lang
        };

        return User.find({where: {username: params.username}}, {transaction: t}).then(function (row) {

            if (row) {

                user = {
                    status_id: params.status_id,
                    prof_id: params.prof_id,
                    emp_id: params.emp_id,
                    user_lang: params.user_lang
                };

                return row.updateAttributes(user, {transaction: t});

            } else {

                return User.create(user, {transaction: t});

            }

        });

    }).catch(function (error) {

        callback(error, false);

    }).then(function (res) {

        callback(null, res);

    });
};