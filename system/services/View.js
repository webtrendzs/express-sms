exports.checkAuthenticated = function (req) {

    if (req.user && req.user.isAuthenticated) {
        return new Promise(Utils.promise(null,  req.user.prof_id));
    } else {
        return new Promise(Utils.promise(true, null));

    }

};

exports.render = function (template) {

    return {

        with: function (req, res, data) {

            Menu.profile(req, req.user.prof_id, function (err, profile) {

                var options = _.extend({
                    menu: profile.menu,
                    user: req.user,
                    url: req.path,
                    company: req.__(Config.get('company')),
                    title: Config.get('client'),
                    lang: req.getLocale(),
                    space: Config.get('space') //TODO
                }, data);

                res.render(template, options);
            });

        }
    }

};

var load = function (req, prof_id, callback) {

    var tree = require(__dirname + '/../helpers/menu/_tree.js');

    var menu = tree.menu();

    var UserProfile = require(__dirname + '/../helpers/menu/_profile.js');

    UserProfile.permissions({
        filters: {
            profile_id: prof_id
        }
    }, function (err, permissions) {

        var user_menu = [];

        for (var i = 0; i < menu.length; i++) {
            var parent = menu[i];
            var p_clone = clone(parent, ['name', 'has_items']);
            p_clone.items = [];
            var has_items = parent.has_items;

            if (!has_items) {

                if (parent.permissions) {

                    for (var x = 0; x < permissions.rows.length; x++) {
                        if (parent.permissions.view && permissions.rows[x].name === parent.permissions.view) {
                            user_menu.push(parent);
                            break;
                        }
                    }
                } else {
                    user_menu.push(parent);
                }

            } else {

                var children = parent.items;

                for (var c = 0; c < children.length; c++) {
                    var child = children[c];

                    if (child.permissions) {

                        for (var x = 0; x < permissions.rows.length; x++) {
                            if (child.permissions.view && permissions.rows[x].name === child.permissions.view) {
                                p_clone.items.push(child);
                                break;
                            }
                        }
                    } else {
                        p_clone.items.push(child);
                    }
                }

                if (p_clone.items.length > 0)
                    user_menu.push(p_clone);
            }
        }

        return callback(null, {permissions: permissions, menu: user_menu, item_name: tree.get_item_name(req.path)});
    });
};

var clone = function (obj, items) {
    var clone = {};
    for (i in items) {
        clone[items[i]] = obj[items[i]];
    }
    return clone;
};