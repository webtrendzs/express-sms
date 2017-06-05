module.exports.controller = function (app) {
  
  var load = function (req, res, errors, message) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      NotificationGroup.findAll({where: {account_id: req.user.user_id}}).then(function (groups) {
        MessageTemplateService.loadTemplates({user_id: req.user.user_id}, function (err, templates) {
          View.render('notifications/notify').with(req, res, {
            groups   : groups,
            templates: templates,
            item_name: req.__('Notify')
          });
        });
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  };
  
  app.get('/:space/notification/groups', Auth.can('view_notification_groups'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      var config = Config.with({
        name   : 'notification-groups',
        filters: {
          account_id: req.user.user_id
        }
      });
      
      Loader.load(config, function (err, groups) {
        View.render('notification-groups/index').with(req, res, {
          data     : groups.rows,
          item_name: req.__('Notification Group'),
          can_edit : Auth.has_permission(req, 'view_notification_groups'),
          can_add  : Auth.has_permission(req, 'view_notification_groups')
        });
        
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get("/:space/notification/notify", Auth.can('can_notify_users'), function (req, res) {
    load(req, res, null);
  });
  
  app.post("/:space/notification/notify", Auth.can('can_notify_users'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      req.assert('group', 'Group is required').notEmpty();
      req.assert('template_id', 'You must assign a template to the group').notEmpty();
      
      var errors = req.validationErrors();
      
      if (!errors) {
        require(__dirname + '/../helpers/create/notify.js').notify(req.body, function (err, result) {
          if (!err) {
            res.redirect('/' + req.params.space + '/notification/approve');
          } else {
            load(req, res, errors, err.msg);
          }
        });
        
      } else {
        load(req, res, errors);
      }
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
  });
  
  app.get("/:space/notification/approve", Auth.can('view_notifications'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      var config = Config.with({
        name: 'notifications'
      });
      
      Loader.load(config, function (err, data) {
        
        View.render('notifications/index').with(req, res, {
          data       : data,
          item_name  : req.__('Notifications'),
          can_add    : Auth.has_permission(req, 'view_notification_groups'),
          can_approve: Auth.has_permission(req, 'can_approve_sms')
        });
      });
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
  });
  
  app.get("/:space/notification/:action/:notification_id", Auth.can('can_notify_users'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      Notification.findOne({where: {id: req.params.notification_id}}).then(function (notification) {
        
        if (notification) {
          sequelize.query('select attribute_value from tbl_message_template_attribute_values ' +
              'where attribute_id in (select id from tbl_message_template_attributes where ' +
              'group_id = '+ notification.groupid +' and attribute_name = \'phone\')', {type: Sequelize.QueryTypes.SELECT})
            .then(function(msisdns) {
              msisdns = msisdns.map(function(row){ return row.attribute_value; });
              var group_members = new Promise(function(resolve, reject){
                var _members = [];
                if(notification.include_manual_members) {
                  NotificationGroupMember.findAll({
                    where     : {group_id: notification.groupid},
                    attributes: ['phone']
                  }).then(function (members) {
      
                    if (members) {
                      _.each(members, function (member) {
                        _members.push(member.phone);
                      });
                    }
                    resolve(_members);
                  });
                } else {
                  resolve(_members);
                }
              });
              
              var _msisdns = new Promise(function(resolve, reject){ resolve(msisdns); });
              
              Promise.all([group_members, _msisdns]).then(function(results){
                
                MessageTemplates.findOne({
                  where     : {id: notification.template_id},
                  attributes: ['message']
                }).then(function (template) {
                  if(template) {
                    SMS.sendBulk('table', _.flatMap(results), template.message, false, function (err, success) {
                      Utils.log(err);
                      notification.updateAttributes({approved: true});
                      res.redirect('/' + req.params.space + '/notification/approve');
                    });
                  }
                });
                
              }).catch(function(err){
                Utils.log(err);
              });
             
            });
        }
      });
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
  });
};