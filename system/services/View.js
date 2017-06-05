exports.checkAuthenticated = function (req) {
  
  if (req.user && req.user.isAuthenticated) {
    return new Promise(Utils.promise(null, req.user.prof_id));
  } else {
    return new Promise(Utils.promise(true, null));
    
  }
  
};

exports.json = function (req, res, data) {
  var options = _.extend({
    company: req.__(Config.get('company')),
    title  : Config.get('client'),
    lang   : req.getLocale(),
  }, data);
  
  return res.json(options);
};

exports.render = function (template) {
  
  return {
    
    with: function (req, res, data) {
      SmsAccountTransactions.sum('amount', {where: {account_id: req.user.user_id}})
        .then(function (sum) {
          Menu.profile(req, req.user.prof_id, function (err, profile) {
            var options = _.extend({
              menu   : profile.menu,
              user   : _.merge(req.user, {
                credit_balance: Utils.floatNumber(sum, 'KES')
              }),
              url    : req.path,
              company: req.__(Config.get('company')),
              title  : Config.get('client'),
              lang   : req.getLocale(),
              space  : Config.get('space') //TODO
            }, data);
            
            res.render(template, options);
          });
        });
      
    }
  }
  
};