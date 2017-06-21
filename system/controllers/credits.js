module.exports.controller = function (app) {
  
  app.get("/:space/credits", function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      return View.render('payments/credits').with(req, res, {
        prof_id  : prof_id,
        item_name: 'SMS Credits'
      });
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
    
  });
  
  app.get("/:space/credits/buy", function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      return View.render('payments/buy_credits').with(req, res, {
        prof_id  : prof_id,
        item_name: 'Buy SMS Credits'
      });
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
    
  });
  
  app.post("/:space/credits/buy", function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      var request = require('request');
      
      request.post({
        url : Config.get('remote_url') + '/' + req.params.space + '/v1/payments/receive',
        form: {
          account_id: req.user.user_id,
          amount    : req.body.amount
        }
      }, function (a, b, _res) {
        if (_res.err) {
          return View.render('payments/buy_credits').with(req, res, {
            item_name: 'Buy SMS Credits',
            message  : 'We could not process your payment at the moment. Try again later'
          });
        } else {
          res.redirect('/');
        }
      });
    }).catch(function (failed) {
      console.log(failed);
      res.redirect('/login');
      
    });
    
  });
  
};