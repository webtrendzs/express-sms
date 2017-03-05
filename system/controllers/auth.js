module.exports.controller = function (app) {

    var config = Config.defaults({});
    var passport = app.get("passport");

    app.get("/login", function (req, res) {
        
        res.render('login', {
            title: config.client,
            username: '',
            lang: req.getLocale()
        });
    });

    app.get("/forgot", function (req, res) {
        res.render('forgot', {
            lang: req.getLocale()
        });
    });

    app.post("/login", function (req, res) {
        
        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var sessionID = req.sessionID;

        passport.authenticate('local', function (err, user, info) {

            var username = req.body.username;
            if (err) {
                log_failure(info.message, username, ip);
                return res.render('login', {"message": info.message, "username": username});
            }

            if (!user) {
                log_failure(info.message, username, ip);
                return res.render('login', {message: info.message, "username": username});
            }

            req.logIn(user, function (err) {
                if (err) {
                    log_failure(info.message, username, ip);
                    return res.render('login', {message: info.message});
                } else {
                    
                    var userID = user.user_id;
                    var usrStr = "mticket_sess:" + userID;

                    redisClient.hgetall(usrStr, function (err, obj) {

                        if (obj == null) {

                            obj = {
                                "user_id": userID,
                                "sessions": [req.sessionID]
                            };

                        } else {

                            var sessions = obj.sessions;

                            if (sessions == null) {
                                sessions = [];
                            } else {
                                sessions = sessions.split(',');
                            }

                            if (sessions.indexOf(req.sessionID) == -1) {
                                sessions.push(req.sessionID);
                            }

                            obj["sessions"] = sessions;
                        }

                        obj.user_id = userID;
                        obj.userfullname = user.userfullname;
                        obj.username = user.username;

                        var lang = req.body.user_lang;

                        if (lang == '') {
                            lang = user.user_lang;
                        }

                        req.setLocale(lang);
                        res.cookie('locale', lang);

                        redisClient.HMSET(usrStr, obj);

                        log_session(req.sessionID, userID, ip);

                        if (req.query.p)
                            return res.redirect('/' + req.query.p);
                        else
                            return res.redirect('/');

                    });
                }
            });

        })(req, res);
    });

    app.get('/logout', function (req, res) {

        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
        var logout = false;
        var userID = -1;

        if (req.user) {

            if (req.user.isAuthenticated) {

                userID = req.user.user_id;

                var usrStr = Config.get('app_name') + "_sess:" + userID;

                redisClient.hgetall(usrStr, function (err, obj) {

                    if (obj != null) {

                        var sessions = obj.sessions;

                        if (sessions == null) {
                            close_user_session(req.sessionID, userID, ip);
                            req.logout();
                            res.redirect('/login');

                        } else {
                            sessions = sessions.split(',');
                            var index = sessions.indexOf(req.sessionID);
                            if (index > -1) {
                                sessions.splice(index, 1);
                            }

                            obj["sessions"] = sessions;

                            redisClient.HMSET(usrStr, obj);

                            close_user_session(req.sessionID, userID, ip);
                            req.logout();
                            res.redirect('/login');
                        }

                    } else {
                        close_user_session(req.sessionID, userID, ip);
                        req.logout();
                        res.redirect('/login');
                    }
                });
            } else { //NOT AUTHEN

                logout = true;

            }
        } else {

            logout = true;
        }

        if (logout) {
            close_user_session(req.sessionID, userID, ip);
            req.logout();
            res.redirect('/login')
        }
    });

    app.get('/:space/change-password', Auth.is('IS_AUTHENTICATED'), function (req, res) {


        res.render('change-password', {
            user: req.user,
            lang: req.getLocale(),
            title: 'Change your password'
        });
    });

    app.post('/:space/change-password', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        req.assert('current_password', req.__('Current Password is required')).notEmpty();
        req.assert('new_password', req.__('New Password is required')).notEmpty();
        req.assert('new_password_repeat', req.__('Repeat Password is required')).notEmpty();

        req.assert('new_password', req.__('New Passwords do not match')).equals(req.body.new_password_repeat);

        req.assert('new_password', req.__('Password must have 6 to 20 characters')).len(6, 20);
        req.assert('new_password', req.__('Password must have atleast one word and one number')).isAlphanumeric();

        var errors = req.validationErrors();

        if (!errors) {

            require(__dirname + '/../helpers/edit/password.js').edit(req.user.user_id, req.body, function (err, result) {


                if (!result) {

                    res.render('change-password', {
                        errors: err,
                        user: req.user,
                        lang: req.getLocale()
                    });

                } else
                    res.redirect('/logout');
            });

        } else {

            res.render('change-password', {
                errors: errors,
                user: req.user,
                lang: req.getLocale()
            });
        }
    });

    app.get('/change-password', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        var prof_id = req.user.prof_id;

        Menu.profile(req,prof_id, function (err, profile) {

                    res.render('users/change-password', {
                        user: req.user,
                        lang: req.getLocale(),
                        menu:profile.menu,
                        title: req.__('Change your password')
                    });
        });

    });

    app.post('/change-password', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        req.assert('current_password', req.__('Current Password is required')).notEmpty();
        req.assert('new_password', req.__('New Password is required')).notEmpty();
        req.assert('new_password_repeat', req.__('Repeat Password is required')).notEmpty();

        req.assert('new_password', req.__('New Passwords do not match')).equals(req.body.new_password_repeat);

        req.assert('new_password', req.__('Password must have 6 to 20 characters')).len(6, 20);
        req.assert('new_password', req.__('Password must have atleast one word and one number')).isAlphanumeric();

        var errors = req.validationErrors();

        var prof_id = req.user.prof_id;

        if (!errors) {

            require(__dirname + '/../helpers/edit/password.js').edit(req.user.user_id, req.body, function (error, result) {


                if (!result) {

                    Menu.profile(req,prof_id, function (err, profile) {

                        res.render('users/change-password', {
                            errors: error,
                            user: req.user,
                            lang: req.getLocale(),
                            menu:profile.menu,
                            title: req.__('Change your password')
                        });
                    });

                } else
                    res.redirect('/logout');
            });
        } else {

            Menu.profile(req,prof_id, function (err, profile) {

                res.render('users/change-password', {
                    errors: errors,
                    user: req.user,
                    lang: req.getLocale(),
                    menu:profile.menu,
                    title: req.__('Change your password')
                });
            });

        }
    });

    app.get("/session/kill/:sid", function (req, res) {

        var sid = req.params.sid;

        var ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;

        var seq = app.get("sequelize");

        var sql = "select * from tblusersessions where ses_id = " + parseInt(sid);

        sequelize.query(sql,{type: seq.QueryTypes.SELECT}).then(function (data) {

                if (data.length == 1) {
                    var user_id = data[0].ses_user;
                    var session_id = data[0].session_id;
                    close_user_session(session_id, user_id, ip, function (err, data) {
                        res.redirect('/'+Config.get('space')+'/report/user-sessions');
                        kill_redis_session(user_id, session_id);
                        log_session_killed(user_id, ip, session_id);
                    });
                } else
                    res.redirect('/'+Config.get('space')+'/report/user-sessions');
            });
    });

    var log_session_killed = function (userid, ip, session_id) {

        var sql = 'insert into tblaudittrail("actionType", "userid", "oldValue", "newValue", "actiondate", "tableName") values(:a, :b, :c, :d,now(), :e)';

        sequelize.query(sql, {
                replacements: {
                    a: "'System Logout'",
                    b: userid,
                    c: "'N/A'",
                    d: "'Session Killed IP Address: " + ip + "'",
                    e: "'tblusersessions'"
                }
            })
            .then(function (data) {

            }).catch(function (err) {
            console.log(err);
        });
    };

    var log_failure = function (info, username, ip) {

        var sql = "insert into tbllogfailerror(logf_usrname, logf_ip, logf_reason, logf_date) values(:u,:ip,:m,:t)";

        var syssql = "update sysusers set login_tries=login_tries::int + :tries WHERE username=:user";

        sequelize.query(sql, {replacements: {u: username, ip: ip, m: info.message || info, t: 'now()'}}).then(function (data, meta) {
                // only increment on login fails
                if (info.log_attempts) {
                    sequelize.query(syssql, {replacements: {user: username, tries: 1}})
                        .then(function (data) {
                        }).catch(function (err) {
                        console.log(err);
                    });
                }
            }).catch(function (err) {
            console.log(err)
        });

    };

    var log_session = function (session_id, user_id, ip) {

        var sql = "insert into tblusersessions(ses_status, ses_user, ses_onuserip, ses_ondte, session_id) values(1,:u,:ip,now(), :sid)";

        sequelize.query(sql, {replacements: {u: user_id, ip: ip, sid: session_id}}).then(function (data) {
                // reset login tries on successfull login
                var syssql = "update sysusers set login_tries=:tries WHERE user_id=:u";

                sequelize.query(syssql, {replacements: {u: user_id, tries: 0}}).then(function (data) {

                }).catch(function (err) {
                    console.log(err);
                });
            }).catch(function (err) {
            console.log(err);
        });
    };

    var close_user_session = function (session_id, user_id, ip, callback) {

        var sql = "update tblusersessions set ses_status = 0, ses_offuserip=:ip, ses_offdte=now() where ses_user=:u and session_id=:sid";

        sequelize.query(sql, {replacements: {u: user_id, ip: ip, sid: session_id}}).then(function (data) {

                if (callback)
                    callback(null, true);
            }).catch(function (err) {

        });
    };


    var kill_redis_session = function (user_id, session_id) {

        redisClient.set(Config.get('app_name') + "_sess:" + session_id, "");
    };
};