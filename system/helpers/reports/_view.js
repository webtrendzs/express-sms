module.exports = {

    respond: function (req, res, profile) {

        var space = req.params.space;
        var report_name = req.params.name;

        return function (err, data) {

            var item_name = profile.item_name;

            if (data.action_buttons) {

                for (var xx = 0; xx < data.action_buttons.length; xx++) {
                    var ab = data.action_buttons[xx];

                    if (ab.permission) {

                        if (!Auth.has_permission(req, ab.permission)) {

                            data.action_buttons.splice(xx, 1);
                        }
                    }
                }
            }

            Paginator.paginate({
                data: data.rows,
                page: data.page,
                pageSize: data.limit,
                total: data.total
            }).then(function (pagination) {

                var view = req.view || data.view;

                return res.render(view, {
                    menu: profile.menu,
                    data: data,
                    space: space,
                    pagination: pagination.renderer.render({
                        pagingLoadResult: pagination.result,
                        contextURL: "/" + space + "/report/" + report_name,
                        params: data.params
                    }),
                    user: req.user,
                    path: req.path,
                    target: report_name,
                    lang: req.getLocale(),
                    item_name: item_name,
                    export_url: Report.getExportUrl(req, space, report_name)
                });

            });

        }
    },

    view: function (req, res) {

        var space = req.params.space;

        _.merge(res.locals, {
            path: req.url,
            space: space
        });

        var report_name = req.params.name, prof_id = 'genesis_user', _this = this;

        if (req.user)
            prof_id = req.user.prof_id;

        Menu.profile(req,prof_id, function (err, profile) {

            return Report.render(report_name, req, _this.respond(req, res, {
                item_name: profile.item_name,
                menu: profile.menu
            }));

        });


    }
};
