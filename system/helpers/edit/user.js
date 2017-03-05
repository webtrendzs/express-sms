module.exports.edit = function (id, params, callback) {

    sequelize.transaction(function (t) {

        return User.find({where: {user_id: id}}, {transaction: t}).then(function (row) {

            return row.updateAttributes({
                userfullname: params.userfullname,
                username: params.username,
                prof_id: params.prof_id,
                useremail: params.useremail,
                userphone: params.userphone,
                status_id: params.status_id,
                emp_id: params.emp_id,
                user_lang: params.user_lang,
                login_tries: params.login_tries
            }, {transaction: t}).then(function (p) {
                return p;
            });

        });

    }).catch(function (error) {

        callback(error, false);

    }).then(function (res) {

        callback(null, res);

    });
};