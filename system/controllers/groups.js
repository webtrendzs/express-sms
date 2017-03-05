module.exports.controller = function (app) {

    app.get('/:space/groups', Auth.can('view_user_groups'), function (req, res) {

        var space = req.params.space;

        var config = Config.defaults({
            space: space,
            filters:{},
            name: 'groups'
        });

        Loader.load(config, function (err, data) {

            View.render('users/groups').with(req, res, {
                data: data,
                item_name: req.__('User Groups'),
                can_edit: Auth.has_permission(req, 'edit_user_groups'),
                can_add: Auth.has_permission(req, 'add_user_groups')
            });
        });
    });

    app.get('/:space/group/create', Auth.can('add_user_groups'), function (req, res) {

        var space = req.params.space;

        View.render('users/groups').with(req, res, {
            title: req.__('Create Group'),
            row: {name: ''},
            url: "/" + space + "/group/create",
            action: 'create',
            item_name: req.__('Group / Create')
        });
    });

    app.post('/:space/group/create', Auth.can('add_user_groups'), function (req, res) {

        var space = req.params.space;

        req.assert('name', 'Name is required').notEmpty();

        var prof_id = req.user.prof_id;

        var errors = req.validationErrors();

        if (!errors) {

            require(__dirname + '/../helpers/create/group.js').create_group(req.body, function (err, result) {

                if (!err) {
                    res.redirect('/' + space + '/groups');
                } else {

                    Menu.profile(req, prof_id, function (err, profile) {

                        res.render('users/group_edit', {
                            title: req.__('Create'),
                            item_name: req.__('Group / Create'),
                            menu: profile.menu,
                            url: "/" + space + "/group/create",
                            space: space,
                            lang: req.getLocale(),
                            action: 'create',
                            row: {
                                name: req.body.name,
                            },
                            permissions: permissions,
                            message: err.msg,
                            user: req.user
                        });
                    });
                }
            });

        } else {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('users/group_edit', {
                    title: req.__('Create'),
                    item_name: req.__('Group / Create'),
                    menu: profile.menu,
                    url: "/" + space + "/group/create",
                    space: space,
                    lang: req.getLocale(),
                    action: 'create',
                    row: {
                        name: req.body.name,
                    },
                    permissions: permissions,
                    message: err.msg,
                    user: req.user
                });
            });
        }
    });

    app.get('/:space/group/edit/:id', Auth.can('edit_user_groups'), function (req, res) {

        var prof_id = req.user.prof_id;
        var space = req.params.space;

        load_group(req, function (err, group) {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('users/group_edit', {
                    title: req.__('Edit'),
                    item_name: req.__('Group / Edit'),
                    menu: profile.menu,
                    row: group.rows[0],
                    lang: req.getLocale(),
                    space: space,
                    action: 'edit',
                    url: "/" + req.params.space + "/group/edit/" + req.params.id,
                    user: req.user
                });
            });

        });
    });

    app.post('/:space/group/edit/:id', Auth.can('edit_user_groups'), function (req, res) {

        req.assert('name', req.__('Name is required')).notEmpty();

        var prof_id = req.user.prof_id;
        var space = req.params.space;

        var errors = req.validationErrors();

        if (!errors) {

            require(__dirname + '/../helpers/edit/group.js').edit_group(req.params.id, req.body, function (err, result) {

                if (!err) {
                    res.redirect('/' + req.params.space + '/groups');
                } else {

                    Menu.profile(req, prof_id, function (err, profile) {

                        res.render('users/group_edit', {
                            title: req.__('Edit'),
                            item_name: req.__('Group / Edit'),
                            menu: profile.menu,
                            space: space,
                            lang: req.getLocale(),
                            action: 'edit',
                            row: {
                                name: req.body.name ? req.body.name : ''
                            },
                            url: "/" + req.params.space + "/group/edit/" + req.params.id,
                            message: err.msg,
                            user: req.user
                        });
                    });
                }
            });
        } else {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('users/group_edit', {
                    title: req.__('Edit'),
                    item_name: req.__('Group / Edit'),
                    menu: profile.menu,
                    space: space,
                    lang: req.getLocale(),
                    action: 'edit',
                    row: {
                        name: req.body.name ? req.body.name : ''
                    },
                    url: "/" + req.params.space + "/group/edit/" + req.params.id,
                    message: err.msg,
                    user: req.user
                });
            });
        }
    });


    var load_group = function (req, callback) {

        var config = Config.defaults({
            name: 'groups',
            filters: {
                group_id: req.params.id
            }
        });

        Loader.load(config, function (err, data) {
            callback(err, data);
        });
    };

};