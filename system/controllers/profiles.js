module.exports.controller = function (app) {

    var UserProfile = require(__dirname + '/../helpers/menu/_profile.js');

    app.get('/:space/profiles', Auth.can('view_user_profiles'), function (req, res) {

        var space = req.params.space;
        var prof_id = req.user.prof_id;

        var config = Config.defaults({
            filters: {},
            name: 'profiles'
        });

        Loader.load(config, function (error, data) {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('profiles/index', {
                    menu: profile.menu,
                    data: data,
                    user: req.user,
                    groups: data.groups,
                    lang: req.getLocale(),
                    acl: Config.get('acl_index')(),
                    space: space,
                    item_name: req.__('Profiles'),
                    can_edit: Auth.has_permission(req, 'edit_user_profiles'),
                    can_delete: Auth.has_permission(req, 'delete_user_profiles'),
                    can_add: Auth.has_permission(req, 'add_user_profiles')
                });
            });
        });
    });

    app.get('/:space/profile/create', Auth.can('add_user_profiles'), function (req, res) {

        var space = req.params.space, gp = {};
        var prof_id = req.user.prof_id;

        var permissions = require(__dirname + '/../auth/permission_store.js').all();

        _.each(permissions, function (v, i) {


            if (gp[v.group] === undefined)
                gp[v.group] = [];

            gp[v.group].push(v);

        });

        UserProfile.groups({filters: {}}, function (error, groups) {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('profiles/edit', {
                    title: req.__('Create'),
                    item_name: req.__('Profile / Create'),
                    menu: profile.menu,
                    url: "/" + space + "/profile/create",
                    space: space,
                    action: 'create',
                    lang: req.getLocale(),
                    row: {
                        prof_name: '',
                        status_id: 1
                    },
                    acl: Config.get('acl_index')('asArray'),
                    groups: groups.rows,
                    permissions: gp,
                    user: req.user
                });
            });
        });

    });

    app.post('/:space/profile/create', Auth.can('add_user_profiles'), function (req, res) {

        var space = req.params.space, gp = {};

        req.assert('name', 'Name is required').notEmpty();
        req.assert('status', 'Status is required').notEmpty();

        var prof_id = req.user.prof_id;
        var permissions = require(__dirname + '/../auth/permission_store.js').all();

        _.each(permissions, function (v, i) {


            if (gp[v.group] === undefined)
                gp[v.group] = [];

            gp[v.group].push(v);

        });

        var errors = req.validationErrors();

        if (!errors) {

            UserProfile.groups({filters: {}}, function (error, groups) {

                require(__dirname + '/../helpers/create/profile.js').create_profile(_.merge(req.body, {space: space}), function (error, result) {

                    if (!error) {
                        res.redirect('/' + space + '/profiles');
                    } else {

                        Menu.profile(req, prof_id, function (err, profile) {

                            res.render('profiles/edit', {
                                title: req.__('Create'),
                                item_name: req.__('Profile / Create'),
                                menu: profile.menu,
                                url: "/" + space + "/profile/create",
                                space: space,
                                lang: req.getLocale(),
                                action: 'create',
                                row: {
                                    prof_name: req.body.name,
                                    group_id: req.body.group_id,
                                    acl_index: req.body.acl_index,
                                    status_id: req.body.status
                                },
                                permissions: gp,
                                acl: Config.get('acl_index')('asArray'),
                                groups: groups,
                                message: error.msg,
                                user: req.user
                            });
                        });
                    }
                });
            })


        } else {

            UserProfile.groups({filters: {}}, function (error, groups) {

                Menu.profile(req, prof_id, function (err, profile) {

                    res.render('profiles/edit', {
                        title: req.__('Create'),
                        item_name: req.__('Profile / Create'),
                        menu: profile.menu,
                        url: "/" + space + "/profile/create",
                        space: space,
                        lang: req.getLocale(),
                        action: 'create',
                        row: {
                            prof_name: req.body.name,
                            group_id: req.body.group_id,
                            acl_index: req.body.acl_index,
                            status_id: req.body.status
                        },
                        acl: Config.get('acl_index')('asArray'),
                        permissions: gp,
                        groups: groups,
                        errors: errors,
                        user: req.user
                    });
                });
            });
        }
    });


    app.get('/:space/profile/delete/:id', Auth.can('delete_user_profiles'), function (req, res) {

        var prof_id = req.params.id;
        var space = req.params.space;

        UserProfile.delete(prof_id, function (err, success) {

            res.redirect('/' + space + '/profiles');

        });
    });

    app.get('/:space/profile/edit/:id', Auth.can('edit_user_profiles'), function (req, res) {

        var prof_id = req.user.prof_id, gp = {};
        var space = req.params.space;

        UserProfile.permissions({
            filters: {
                profile_id: req.params.id
            }
        }, function (err, permissions) {

            UserProfile.load({id: req.params.id}, function (error, prof) {

                Menu.profile(req, prof_id, function (err, profile) {

                    var marked = UserProfile.mark(permissions);

                    _.each(marked, function (v, i) {


                        if (gp[v.group] === undefined)
                            gp[v.group] = [];

                        gp[v.group].push(v);

                    });

                    res.render('profiles/edit', {
                        title: req.__('Edit'),
                        item_name: req.__('Profile / Edit'),
                        menu: profile.menu,
                        row: prof.rows[0],
                        lang: req.getLocale(),
                        permissions: gp,
                        groups: prof.groups,
                        space: space,
                        action: 'edit',
                        acl: Config.get('acl_index')('asArray'),
                        url: "/" + req.params.space + "/profile/edit/" + req.params.id,
                        user: req.user
                    });
                });

            });
        });

    });

    app.post('/:space/profile/edit/:id', Auth.can('edit_user_profiles'), function (req, res) {

        req.assert('name', req.__('Name is required')).notEmpty();
        req.assert('status', req.__('Status is required')).notEmpty();

        var prof_id = req.user.prof_id, gp = {};
        var space = req.params.space;

        var errors = req.validationErrors();

        if (!errors) {

            require(__dirname + '/../helpers/edit/profile.js').edit_profile(req.params.id, _.merge(req.body, {space: space}), function (err, result) {

                if (!err) {
                    res.redirect('/' + req.params.space + '/profiles');
                } else {

                    UserProfile.permissions({
                        space: space,
                        filters: {
                            profile_id: req.params.id
                        }
                    }, function (err, permissions) {

                        var marked = UserProfile.mark(permissions);

                        _.each(marked, function (v, i) {


                            if (gp[v.group] === undefined)
                                gp[v.group] = [];

                            gp[v.group].push(v);

                        });

                        UserProfile.load({id: req.params.id}, function (perror, prof) {

                            Menu.profile(req, prof_id, function (err, profile) {

                                res.render('profiles/edit', {
                                    title: req.__('Edit'),
                                    item_name: req.__('Profile / Edit'),
                                    menu: profile.menu,
                                    space: space,
                                    lang: req.getLocale(),
                                    action: 'edit',
                                    row: {
                                        prof_name: req.body.prof_name ? req.body.prof_name : '',
                                        status_id: req.body.status_id ? req.body.status_id : 1
                                    },
                                    groups: prof.groups.rows,
                                    permissions: gp,
                                    acl: Config.get('acl_index')('asArray'),
                                    url: "/" + req.params.space + "/profile/edit/" + req.params.id,
                                    message: err.msg,
                                    user: req.user
                                });
                            });
                        });

                    });
                }
            });
        } else {

            UserProfile.permissions({
                space: space,
                filters: {
                    profile_id: req.params.id
                }
            }, function (err, permissions) {

                var marked = UserProfile.mark(permissions);

                _.each(marked, function (v, i) {


                    if (gp[v.group] === undefined)
                        gp[v.group] = [];

                    gp[v.group].push(v);

                });

                UserProfile.load({id: req.params.id}, function (error, prof) {

                    Menu.profile(req, prof_id, function (err, profile) {

                        res.render('profiles/edit', {
                            title: req.__('Edit'),
                            item_name: req.__('Profile / Edit'),
                            menu: profile.menu,
                            space: space,
                            lang: req.getLocale(),
                            action: 'edit',
                            row: {
                                prof_name: req.body.prof_name ? req.body.prof_name : '',
                                status_id: req.body.status_id ? req.body.status_id : 1
                            },
                            groups: prof.groups.rows,
                            permissions: gp,
                            acl: Config.get('acl_index')('asArray'),
                            url: "/" + req.params.space + "/profile/edit/" + req.params.id,
                            errors: errors,
                            user: req.user
                        });
                    });
                });

            });
        }
    });
};