module.exports.auth = function () {

    var ConnectRoles = require('connect-roles');

    var _ = this;

    this.acceptedpaths = [];

    this.get_genesis_permissions = function () {
        var permissions = [];
        return permissions;
    };

    var cRoles = new ConnectRoles({
        failureHandler: function (req, res, action) {
            var accept = req.headers.accept || '';
            res.status(403);
            if (~accept.indexOf('html')) {
                if (req.user && req.user.isAuthenticated) {
                    res.render('access-denied', {action: action});
                } else {
                    var url = '/login';
                    res.redirect(url);
                }
            } else {
                res.send('Access Denied - You don\'t have permission to: ' + action);
            }
        }
    });

    cRoles.use('IS_AUTHENTICATED', function (req, action) {

        if (req.user === undefined) return false;

        if (req.user.isAuthenticated) {

            return true;
        } else
            return false;
    });

    cRoles.use('IS_ADMIN', function (req, action) {
        if (req.user === undefined) return false;
        if (!req.user.isAuthenticated) return false;
        if (req.user.role === 'Administrator') {

            return true;
        } else
            return false;
    });

    cRoles.use(function (req, action) {
        var d = req.query ? req.query : req.body;
        if (req.user === undefined && (d.CSRID != null | d.csrid != null)) {
            var path = req.path;

            for (var i = 0; i < _.acceptedpaths.length; i++) {
                if (path.indexOf(_.acceptedpaths[i]) != -1) {
                    return true;
                }
            }

            return false;
        } else
            return has_permission(req, action);
    });

    var has_permission = function (req, action) {
        if (req.user === undefined) return false;
        if (req.user.isAuthenticated) {

            var permissions = req.user.permissions;

            if (permissions != null) {
                for (var i = 0; i < permissions.length; i++) {
                    var row = permissions[i];
                    if (row.name === action) {
                        return true;
                    }
                }
            }
            return false;
        }
        return false;
    };

    cRoles.has_permission = function (req, action) {
        return has_permission(req, action);
    };

    return cRoles;
};
