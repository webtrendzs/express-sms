module.exports.controller = function (app) {

    var load_notification_group_members = function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            var config = Config.defaults({
                name: 'notification-group-members',
                filters: {
                    group_id: req.params.groupid
                }
            });


            Loader.load(config, function (err, data) {
                delete config.filters;
                View.render('notification-group-members/index').with(req, res, {
                    data: data,
                    prof_id: prof_id,
                    groupid: req.params.groupid,
                    item_name: req.__('Notification Group Members'),
                    can_edit: Auth.has_permission(req, 'view_notification_groups'),
                    can_add: Auth.has_permission(req, 'view_notification_groups')
                });
            });

        }).catch(function (failed) {

            res.redirect('/login');

        });
    };

    app.get("/:space/notification-group/members/:groupid", Auth.can('view_notification_groups'), function (req, res) {
        load_notification_group_members(req, res);
    });

    app.post('/:space/notification-group/member/create/:groupid', Auth.can('create_notification_groups'), function (req, res) {

        var space = req.params.space;

        View.checkAuthenticated(req).then(function (prof_id) {

            req.assert('name', 'Name is required').notEmpty();
            req.assert('phone', 'Phone is required').notEmpty();

            var errors = req.validationErrors();

            if (!errors) {

                require(__dirname + '/../helpers/create/notification-group-member.js').create(req.params.groupid, req.body, function (err, result) {

                    if (!err) {
                        res.redirect('/' + space + '/notification-group/members/' + req.params.groupid);
                    } else {

                        View.render('notification-group-members/edit').with(req, res, {
                            title: req.__('Create'),
                            item_name: req.__('Notification Group / Create'),
                            action: 'create',
                            row: req.body,
                            errors: errors,
                            message: err.msg
                        });
                    }
                });

            } else {
                View.render('notification-group-members/edit').with(req, res, {
                    title: req.__('Create'),
                    item_name: req.__('Notification Group / Create'),
                    action: 'create',
                    row: req.body,
                    errors: errors
                });
            }

        }).catch(function (failed) {

            res.redirect('/login');

        });
    });

    app.get('/:space/notification-group/member/create/:groupid', Auth.can('create_notification_groups'), function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {
            View.render('notification-group-members/edit').with(req, res, {
                title: req.__('Create'),
                item_name: req.__('Notification Group / Create'),
                action: 'create',
                row: {
                    name: '',
                    phone: ''
                }
            });
        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.get("/:space/notification-group/member/upload/:groupid", function (req, res) {
        View.checkAuthenticated(req).then(function (prof_id) {

            var config = Config.defaults({
                name: 'notification-groups',
                filters: {
                    id: req.params.groupid
                }
            });

            Loader.load(config, function (err, data) {
                delete config.filters;
                Utils.log(data);
                View.render('notification-group-members/upload').with(req, res, {
                    group_name: data.rows[0].name,
                    groupid: req.params.groupid,
                    item_name: req.__('Notification Group Members'),
                    can_edit: Auth.has_permission(req, 'view_notification_groups'),
                    can_add: Auth.has_permission(req, 'view_notification_groups')
                });
            });

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.post("/:space/notification-group/member/upload/:groupid", function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            FileManager.uploadFile(req, 'subscribers', function (err, success) {

                if (!err) {

                    res.redirect('/' + space + '/notification-group/members/' + req.params.groupid);

                } else {

                    View.render('notification-group-members/edit').with(req, res, {
                        title: req.__('Create'),
                        action: 'create',
                        groupid: req.params.groupid,
                        item_name: req.__('Notification Group Members'),
                        can_edit: Auth.has_permission(req, 'view_notification_groups'),
                        can_add: Auth.has_permission(req, 'view_notification_groups'),
                        message: "Could not upload file"
                    });
                }
            });

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.get('/:space/notification/groups', Auth.can('view_notification_groups'), function (req, res) {

        var space = req.params.space;

        View.checkAuthenticated(req).then(function (prof_id) {

            var config = Config.defaults({
                space: space,
                name: 'notification-groups'
            });

            Loader.load(config, function (err, data) {
                View.render('notification-groups/index').with(req, res, {
                    data: data,
                    item_name: req.__('Notification Group'),
                    can_edit: Auth.has_permission(req, 'view_notification_groups'),
                    can_add: Auth.has_permission(req, 'view_notification_groups')
                });
            });

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.get('/:space/notification-group/create', Auth.can('create_notification_groups'), function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            View.render('notification-groups/edit').with(req, res, {
                title: req.__('Create'),
                item_name: req.__('Notification Group / Create'),
                action: 'create',
                row: {
                    name: '',
                    country: 'ke',
                    status: 1
                }
            });

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.post('/:space/notification-group/create', Auth.can('create_notification_groups'), function (req, res) {

        var space = req.params.space;

        View.checkAuthenticated(req).then(function (prof_id) {

            req.assert('name', 'Name is required').notEmpty();

            var errors = req.validationErrors();

            if (!errors) {

                require(__dirname + '/../helpers/create/notification-group.js').create(req.body, function (err, result) {

                    if (!err) {
                        res.redirect('/' + space + '/notification-group/members/' + result.id);
                    } else {

                        View.render('notification-groups/index').with(req, res, {
                            title: req.__('Create'),
                            item_name: req.__('Notification Group / Create'),
                            action: 'create',
                            url: "/" + space + "/notification-group/create",
                            row: req.body,
                            message: err.msg,
                        });
                    }
                });

            } else {

                View.render('notification-groups/index').with(req, res, {
                    title: req.__('Create'),
                    item_name: req.__('Notification Group / Create'),
                    action: 'create',
                    url: "/" + space + "/notification-group/create",
                    row: req.body,
                    message: err.msg,
                });
            }

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });

    app.get('/:space/notification-group/edit/:id', Auth.can('create_notification_groups'), function (req, res) {

        var space = req.params.space;

        load_notification_group(req, function (err, prof) {

            View.checkAuthenticated(req).then(function (prof_id) {

                if (prof.rows.length == 1) {
                    View.render('notification-groups/edit').with(req, res, {
                        title: req.__('Edit'),
                        item_name: req.__('Notification Group / Edit'),
                        action: 'edit',
                        row: prof.rows[0],
                        url: "/" + space + "/notification-group/edit/" + req.params.id
                    });
                }

            }).catch(function (failed) {
                res.redirect('/login');
            });

        });
    });

    app.post('/notification-group/edit/:id', Auth.can('create_notification_groups'), function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            req.assert('name', 'Name is required').notEmpty();

            var space = req.params.space;

            var errors = req.validationErrors();

            if (!errors) {

                require(__dirname + '/../helpers/edit/notification-group.js').edit(req.params.id, req.body, space, function (err, result) {

                    if (!err) {
                        res.redirect('/' + space + '/notifications/groups');
                    } else {

                        View.render('notification-groups/edit').with(req, res, {
                            title: req.__('Edit'),
                            item_name: req.__('Notification Group / Edit'),
                            action: 'edit',
                            message: err.msg,
                            row: {
                                name: req.body.name ? req.body.name : '',
                                country: req.body.country ? req.body.country : '',
                                status: req.body.status ? req.body.status : 1
                            },
                            url: "/" + space + "/notification-group/edit/" + req.params.id
                        });
                    }
                });
            } else {

                View.render('notification-groups/edit').with(req, res, {
                    title: req.__('Edit'),
                    item_name: req.__('Notification Group / Edit'),
                    action: 'edit',
                    row: {
                        name: req.body.name ? req.body.name : '',
                        country: req.body.country ? req.body.country : '',
                        status: req.body.status ? req.body.status : 1
                    },
                    errors: errors,
                    url: "/" + space + "/notification-group/edit/" + req.params.id
                });
            }

        }).catch(function (failed) {
            res.redirect('/login');
        });
    });


    var load_notification_group = function (req, callback) {
        var config = Config.defaults({
            space: req.params.space,
            name: 'notification-groups',
            filters: {
                id: req.params.id
            }
        });

        loader.load(app, config, function (err, data) {
            callback(err, data);
        });
    };
};