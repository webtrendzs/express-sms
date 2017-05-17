module.exports.controller = function (app) {

    app.get("/", function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            return View.render('single_sms').with(req, res, {
                prof_id: prof_id
            });

        }).catch(function (failed) {

            res.redirect('/login');

        });

    });

    app.post("/", function (req, res) {

        View.checkAuthenticated(req).then(function (prof_id) {

            req.assert('message', req.__('Message is required')).notEmpty();
            req.assert('recipients', req.__('Recipients are required')).notEmpty();

            var errors = req.validationErrors();

            if (!errors) {

                var body = req.body;

                var recipients = body.recipients.split(',');

                var with_success = {
                    item_name: 'SMS / Send Multiple',
                    message: 'Message(s) sent'
                };

                var with_failure = {
                    item_name: 'SMS / Send Multiple',
                    message: 'Message(s) not sent'
                };

                if(recipients.length>1){

                    SMS.sendBulk('table', recipients, body.message, false, function (err, success) {

                        if (!err) {
                            return View.render('single_sms').with(req, res, with_success);
                        } else {
                            return View.render('single_sms').with(req, res, with_failure);
                        }
                    });
                } else {

                    SMS.send('table', recipients[0], body.message, function (err, success) {
                        if (!err) {
                            return View.render('single_sms').with(req, res, with_success);
                        } else {
                            return View.render('single_sms').with(req, res, with_failure);
                        }
                    });
                }
            } else {

                return View.render('single_sms').with(req, res, {
                    item_name: 'SMS / Send Bulk SMSes',
                    errors: errors
                });
            }

        }).catch(function (failed) {

            res.redirect('/login');

        });

    });
};