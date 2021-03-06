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
        var body         = req.body;
        var recipients   = body.recipients.split(',');
        var with_success = {
          item_name: 'SMS / Send Multiple',
          message  : 'Message(s) sent'
        };
        
        var with_failure = {
          item_name: 'SMS / Send Multiple',
          message  : 'Message(s) not sent'
        };
        
        var sms_config = {
          recipients: recipients,
          account_id: req.user.user_id,
          message   : body.message
        };
        
        SMS.configure(sms_config).then(function (config) {
          Utils.log(config);
          SMS.sendBulk(function (err, success) {
            if (!err) {
              return View.render('single_sms').with(req, res, with_success);
            } else {
              Utils.log(err);
              return View.render('single_sms').with(req, res, with_failure);
            }
          });
        }).catch(function (err) {
          Utils.log(err);
          return View.render('single_sms').with(req, res, with_failure);
        });
        
      } else {
        
        return View.render('single_sms').with(req, res, {
          item_name: 'SMS / Send Bulk SMSes',
          errors   : errors
        });
      }
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
    
  });
};