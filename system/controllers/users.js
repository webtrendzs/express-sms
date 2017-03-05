module.exports.controller = function (app) {

    var conf = Config.defaults({});

    var default_row = {
        user_id: '',
        userfullname: '',
        username: '',
        useremail: '',
        userphone: '',
        status_id: 1,
        login_tries: 0
    };


    app.get('/:space/users', Auth.can('view_system_users'), function (req, res) {

        var space = req.params.space;
        var prof_id = req.user.prof_id;

        var page = req.query.page ? req.query.page : 1;

        var limit = conf.pagination.limit;

        if (req.query.pageSize && !isNaN(req.query.pageSize)) {
            if (req.query.pageSize <= limit) {
                limit = req.query.pageSize;
            }
        }

        var config = Config.with({
            name: 'users',
            pagination: {
                page: page,
                limit: limit
            },
            filters: {},
            user: req.user,
            params: req.query
        });

        Loader.load(config, function (err, data) {

            Menu.profile(req, prof_id, function (err, profile) {

                Paginator.paginate({
                    data: data.rows,
                    page: data.page,
                    pageSize: data.limit,
                    total: data.total
                }).then(function (pagination) {

                    return res.render('users/index', {
                        menu: profile.menu,
                        data: data,
                        space: space,
                        show_user_filter:true,
                        lang: req.getLocale(),
                        item_name: req.__('Users'),
                        user: req.user,
                        can_edit: Auth.has_permission(req, 'edit_system_users'),
                        can_add: Auth.has_permission(req, 'add_system_users'),
                        can_reset: Auth.has_permission(req, 'reset_system_users'),
                        params: req.query,
                        pagination: pagination.renderer.render({
                            pagingLoadResult: pagination.result,
                            contextURL: "/" + space + "/users",
                            params: data.params
                        })
                    });

                });
            });
        });
    });

    app.get('/:space/user/create', Auth.can('add_system_users'), function (req, res) {

        var space = req.params.space;
        var prof_id = req.user.prof_id;

        load_profiles(req, function (err, p_result) {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('users/edit', {
                    title: req.__('Create'),
                    space: space,
                    row: default_row,
                    lang: req.getLocale(),
                    action: 'create',
                    profiles: p_result,
                    menu: profile.menu,
                    item_name: req.__('User / Create'),
                    user: req.user
                });
            });
        }, true);
    });

    app.post('/:space/user/create', Auth.can('add_system_users'), function (req, res) {

        var space = req.params.space;
        var prof_id = req.user.prof_id;

        req.assert('userfullname', req.__('Full Name is required')).notEmpty();
        req.assert('username', req.__('Username is required')).notEmpty();

        req.assert('prof_id', req.__('User Profile is required')).notEmpty();
        req.assert('useremail', req.__('Email is required')).notEmpty();

        req.assert('password', req.__('Password is required')).notEmpty();
        req.assert('password_c', req.__('Confirmation Password is required')).notEmpty();

        req.assert('password', req.__('Passwords do not match')).equals(req.body.password_c);

        req.assert('password', req.__('Password must have 6 to 20 characters')).len(6, 20);
        req.assert('password', req.__('Password must have atleast one word and one number')).isAlphanumeric();

        var errors = req.validationErrors();

        var row = {
            user_id: '',
            userfullname: req.body.userfullname,
            username: req.body.username,
            useremail: req.body.useremail,
            userphone: req.body.userphone,
            status_id: req.body.status_id
        };

        if (!errors) {

            require(__dirname + '/../helpers/create/user.js').create(req.body, function (err, result) {

                if (!err) {

                    res.redirect('/' + space + '/users');

                } else {

                    load_profiles(req, function (err, p_result) {

                        Menu.profile(req, prof_id, function (err, profile) {

                            res.render('users/edit', {
                                title: req.__('Create'),
                                space: space,
                                row: row,
                                action: 'create',
                                profiles: p_result,
                                menu: profile.menu,
                                item_name: req.__('User / Create'),
                                message: err.msg,
                                user: req.user
                            });
                        });
                    }, true);
                }
            });

        } else {

            load_profiles(req, function (err, p_result) {

                Menu.profile(req, prof_id, function (err, profile) {

                    res.render('users/edit', {
                        title: req.__('Create'),
                        space: space,
                        row: row,
                        action: 'create',
                        profiles: p_result,
                        menu: profile.menu,
                        lang: req.getLocale(),
                        item_name: req.__('User / Create'),
                        errors: errors,
                        user: req.user
                    });

                });

            }, true);

        }
    });

    app.get('/:space/user/edit/:id', Auth.can('edit_system_users'), function (req, res) {

        var space = req.params.space;
        var user_id = req.params.id;
        var prof_id = req.user.prof_id;

        var config = Config.with({
            name: 'users',
            user: req.user,
            find_by_id: true,
            filters: {
                user_id: user_id
            }
        });

        Loader.load(config, function (err, data) {

            if (data.rows.length == 1) {

                load_profiles(req, function (err, p_result) {

                    Menu.profile(req, prof_id, function (err, profile) {

                        res.render('users/edit', {
                            item_name: req.__('User / Edit'),
                            space: space,
                            row: data.rows[0],
                            action: 'edit',
                            profiles: p_result,
                            menu: profile.menu,
                            user_id: user_id,
                            lang: req.getLocale(),
                            can_unlock: Auth.has_permission(req, 'unlock_accounts'),
                            user: req.user
                        });
                    });
                });
            } //TODO else
        });

    });

    app.post('/:space/user/edit/:id', Auth.can('edit_system_users'), function (req, res) {

        req.assert('userfullname', req.__('Full Name is required')).notEmpty();
        req.assert('username', req.__('Username is required')).notEmpty();

        req.assert('prof_id', req.__('User Profile is required')).notEmpty();
        req.assert('useremail', req.__('Email is required')).notEmpty();

        var errors = req.validationErrors();

        var prof_id = req.user.prof_id;
        var space = req.params.space;
        var user_id = req.params.id;

        var row = {
            user_id: user_id,
            userfullname: req.body.userfullname,
            username: req.body.username,
            useremail: req.body.useremail,
            userphone: req.body.userphone,
            status_id: req.body.status_id,
            login_tries: req.body.login_tries
        };

        var config = Config.defaults({
            name: 'users',
            user: req.user,
            find_by_id: true,
            filters: {
                user_id: user_id
            }
        });

        if (!errors) {

            require(__dirname + '/../helpers/edit/user.js').edit(req.params.id, req.body, function (err, result) {
                if (!err) {

                    res.redirect('/' + req.params.space + '/users');

                } else {

                    load_profiles(req, function (err, p_result) {

                        Menu.profile(req, prof_id, function (err, profile) {

                            res.render('users/edit', {
                                item_name: req.__('User / Edit'),
                                space: space,
                                row: row,
                                action: 'edit',
                                profiles: p_result,
                                lang: req.getLocale(),
                                menu: profile.menu,
                                user_id: user_id,
                                message: err.msg,
                                user: req.user,
                                can_unlock: Auth.has_permission(req, 'unlock_accounts')
                            });
                        });
                    });

                }
            });

        } else {


            load_profiles(req, function (err, p_result) {

                Menu.profile(req, prof_id, function (err, profile) {

                    res.render('users/edit', {
                        item_name: req.__('User / Edit'),
                        space: space,
                        row: row,
                        action: 'edit',
                        profiles: p_result,
                        menu: profile.menu,
                        user_id: user_id,
                        lang: req.getLocale(),
                        errors: errors,
                        can_unlock: Auth.has_permission(req, 'unlock_accounts'),
                        user: req.user
                    });
                });
            });
        }
    });

    app.get('/:space/user/reset/:id', Auth.can('reset_system_users'), function (req, res) {

        var space = req.params.space;
        var user_id = req.params.id;
        var prof_id = req.user.prof_id;

        var config = Config.defaults({
            name: 'users',
            user: req.user,
            find_by_id: true,
            filters: {
                user_id: user_id
            }
        });

        Loader.load(config, function (err, data) {

            if (data.rows.length == 1) {

                Menu.profile(req, prof_id, function (err, profile) {

                    res.render('users/reset-password', {
                        item_name: req.__('User / Change password'),
                        space: space,
                        row: data.rows[0],
                        menu: profile.menu,
                        title: req.__('Changing password for ') + data.rows[0].userfullname,
                        user_id: user_id,
                        lang: req.getLocale(),
                        user: req.user
                    });
                });

            } //TODO else
        });
    });

    app.post('/:space/user/reset/:id', Auth.can('reset_system_users'), function (req, res) {

        var space = req.params.space;
        var user_id = req.params.id;
        var prof_id = req.user.prof_id;

        req.assert('password', req.__('Password is required')).notEmpty();
        req.assert('password_c', req.__('Confirmation Password is required')).notEmpty();

        req.assert('password', req.__('Passwords do not match')).equals(req.body.password_c);

        req.assert('password', req.__('Password must have 6 to 20 characters')).len(6, 20);
        req.assert('password', req.__('Password must have atleast one word and one number')).isAlphanumeric();

        var errors = req.validationErrors();

        if (!errors) {

            reset_password({user_id: user_id, password: req.body.password}, function (err, success) {

                res.redirect('/' + req.params.space + '/users');
            });

        }
        else {

            var config = Config.defaults({
                name: 'users',
                find_by_id: true,
                user: req.user,
                filters: {
                    user_id: user_id
                }
            });

            Loader.load(config, function (err, data) {

                if (data.rows.length == 1) {

                    Menu.profile(req, prof_id, function (err, profile) {

                        res.render('users/reset-password', {
                            item_name: req.__('User / Change password'),
                            space: space,
                            row: data.rows[0],
                            menu: profile.menu,
                            errors: errors,
                            title: req.__('Changing password for ') + data.rows[0].userfullname,
                            user_id: user_id,
                            lang: req.getLocale(),
                            user: req.user
                        });
                    });
                } //TODO else
            });

        }
    });

    var reset_password = function (user, callback) {

        var where = 'where user_id=' + user.user_id;

        sequelize.query('update sysusers set userpass=\'' + app.encryptPassword(user.password) + '\' ' + where, {type: Sequelize.QueryTypes.UPDATE}).then(function (data) {

            callback(null, data);

        }).catch(function (err) {

            callback(err, null);

        });
    };

    var load_profiles = function (req, callback, is_active) {

        var where = 'where p.space=\'' + Config.get('app_name') + '\'';


        where += ' and (case when ((select acl_index from tblprofiles where cast(prof_id as integer)=' + req.user.prof_id + ')=10) then 1=1 else (p.group_id=(select group_id from tblprofiles where cast(prof_id as integer)=' + req.user.prof_id + ')) end)';

        sequelize.query('select p.prof_id,p.group_id,p.acl_index,(p.prof_name || \' [ \' || (select name from tblusergroups where group_id=p.group_id) || \' ]\') as prof_name from tblprofiles p ' + where, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

            callback(null, data);

        }).catch(function (err) {

            callback(err, null);

        });

    };


};