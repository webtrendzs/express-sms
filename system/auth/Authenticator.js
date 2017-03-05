var LocalStrategy = require('passport-local').Strategy;

module.exports.authenticator = function (passport) {

    passport.serializeUser(function (user, done) {
        done(null, user.username);
    });

    passport.deserializeUser(function (username, done) {

        sequelize.query("select * from sysusers where cast(prof_id as integer) IN (select prof_id from tblprofiles where space='" + Config.get('app_name') + "') and lower(username) = lower( '" + username + "') limit 1",{type:Sequelize.QueryTypes.SELECT})
            .catch(function (err) {

                Utils.log(err);

                return done(err, false, {message: i18n.__('Database Error')});
            })
            .then(function (user) {

                if (user !== undefined) {

                    var _user=user[0];

                    _user.isAuthenticated = true;

                    load_profile_permissions(_user.prof_id,Config.get('space'), function (err, permissions) {

                        _user.permissions = permissions;
                        done(null, _user);
                    });

                } else {
                    return done(null, false, {message: i18n.__('User not found')});
                }
            });

    });

    passport.use(new LocalStrategy(

        function (username, password, done) {

            sequelize.query("select * from sysusers where cast(prof_id as integer) IN (select prof_id from tblprofiles where space='" + Config.get('app_name') + "' ) and lower(username) = lower( '" + username + "') limit 1",{type:Sequelize.QueryTypes.SELECT})
                .catch(function (err) {
                    Utils.log(err);
                    return done(err, false, {message: i18n.__('Database Error')});
                })
                .then(function (user) {

                    if (user !== undefined && user !== null) {

                        var _user=user[0];

                        if (_user.status_id === 0)
                            return done(null, false, {
                                disabled: true,
                                message: i18n.__('Your Account is Disabled. Please contact the administrator.')
                            });
                        if (Utils.encryptPassword(password) !== _user.userpass)
                            return done(null, false, {invalid: true, message: i18n.__('Invalid Password')});
                        else
                            return done(null, _user, {message: i18n.__('Logged In Successfully')});
                    } else {
                        return done(null, false, {exist: false, message: i18n.__('User not found')});
                    }
                });
        }
    ));
};

var load_profile = function (prof_id, space, callback) {

    var config = Config.with({
        name: 'profiles',
        filters: {
            prof_id: prof_id
        }
    });

    Loader.load(config, function (err, data) {

        if (data.rows && data.rows.length == 1)
            callback(err, data.rows[0]);
        else
            callback(true, null);
    });
};

var load_profile_permissions = function (prof_id, space, callback) {

    var config = Config.with({
        name: 'profilepermissions',
        filters: {
            profile_id: prof_id
        }
    });

    Loader.load(config, function (err, data) {
        if (err)
            callback(err, data);
        else
            callback(err, data.rows);
    });
};
