module.exports.controller = function (app) {

    var Reports = require(__dirname + '/../helpers/reports/_view.js');

    app.get('/:space/report/:name', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        return Reports.view(req, res);
    });

    app.post('/:space/report/:name', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        req.query = {filter: true};

        _.extend(req.query, req.body);

        return Reports.view(req, res);
    });

    app.get('/:space/payment/details/:pid', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        var space = req.params.space;
        var pid = req.params.pid;

        var prof_id = 'genesis_user';

        if (req.user)
            prof_id = req.user.prof_id;

        var config = Config.with({
            name: 'payments',
            find_by_id: true,
            filters: {
                receipt: pid
            }
        });

        Loader.load(config, function (err, payment) {

            Menu.profile(req, prof_id, function (err, profile) {

                res.render('reports/payment_details', {
                    item_name: req.__('Payment / Details'),
                    space: space,
                    payment: payment,
                    tickets:payment.tickets,
                    lang: req.getLocale(),
                    menu: profile.menu,
                    can_view_ticket_code: Auth.has_permission(req, 'view_ticket_disputes'),
                    user: req.user,
                    prof_id: prof_id
                });
            });
        });
    });

    app.get('/:space/tickets/disputes', Auth.is('IS_AUTHENTICATED'), function (req, res) {

        var space = req.params.space;
        var loan_id = req.params.loanid;

        var prof_id = 'genesis_user';

        if (req.user)
            prof_id = req.user.prof_id;

        Menu.profile(req, prof_id, function (err, profile) {

            res.render('ticket-disputes', {
                item_name: req.__('Tickets / Disputes'),
                space: space,
                lang: req.getLocale(),
                menu: profile.menu,
                user: req.user,
                prof_id: prof_id
            });
        });

    });
};
