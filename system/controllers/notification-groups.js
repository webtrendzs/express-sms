module.exports.controller = function (app) {
  
  var multer = require('multer');
  var upload = multer({dest: __dirname + '/../../' + Config.get('uploadDir')});
  
  var load_notification_group_members = function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      var config = Config.defaults({
        name   : 'notification-group-members',
        filters: {
          group_id: req.params.groupid
        }
      });
      
      Loader.load(config, function (err, data) {
        delete config.filters;
        View.render('notification-group-members/index').with(req, res, {
          data     : data,
          prof_id  : prof_id,
          groupid  : req.params.groupid,
          item_name: req.__('Notification Group Members'),
          can_edit : Auth.has_permission(req, 'view_notification_groups'),
          can_add  : Auth.has_permission(req, 'view_notification_groups')
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
              title    : req.__('Create'),
              item_name: req.__('Notification Group / Create'),
              action   : 'create',
              row      : req.body,
              errors   : errors,
              message  : err.msg
            });
          }
        });
        
      } else {
        View.render('notification-group-members/edit').with(req, res, {
          title    : req.__('Create'),
          item_name: req.__('Notification Group / Create'),
          action   : 'create',
          row      : req.body,
          errors   : errors
        });
      }
      
    }).catch(function (failed) {
      
      res.redirect('/login');
      
    });
  });
  
  app.get('/:space/notification-group/member/create/:groupid', Auth.can('create_notification_groups'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      View.render('notification-group-members/edit').with(req, res, {
        title    : req.__('Create'),
        item_name: req.__('Notification Group / Create'),
        action   : 'create',
        row      : {
          name : '',
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
        name   : 'notification-groups',
        filters: {
          id        : req.params.groupid,
          account_id: req.user.user_id
        }
      });
      
      Loader.load(config, function (err, data) {
        delete config.filters;
        View.render('notification-group-members/upload').with(req, res, {
          group_name: data.rows[0].name,
          groupid   : req.params.groupid,
          item_name : req.__('Notification Group Members'),
          can_edit  : Auth.has_permission(req, 'view_notification_groups'),
          can_add   : Auth.has_permission(req, 'view_notification_groups')
        });
      });
      
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.post("/:space/notification-group/member/upload/:groupid", upload.single('subscribers'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      FileManager.uploadFile(req, function (err, success) {
        
        if (!err) {
          res.redirect('/' + req.params.space + '/notification-group/members/' + req.params.groupid);
        } else {
          
          View.render('notification-group-members/edit').with(req, res, {
            title    : req.__('Create'),
            action   : 'create',
            groupid  : req.params.groupid,
            item_name: req.__('Notification Group Members'),
            can_edit : Auth.has_permission(req, 'view_notification_groups'),
            can_add  : Auth.has_permission(req, 'view_notification_groups'),
            message  : "Could not upload file"
          });
        }
      });
      
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get('/:space/notification-group/create', Auth.can('create_notification_groups'), function (req, res) {
    
    View.checkAuthenticated(req).then(function (prof_id) {
      
      View.render('notification-groups/edit').with(req, res, {
        title    : req.__('Create'),
        item_name: req.__('Notification Group / Create'),
        action   : 'create',
        row      : {
          name   : '',
          country: 'ke',
          status : 1
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
            res.redirect('/' + space + '/notification/groups');
          } else {
            
            View.render('notification-groups/index').with(req, res, {
              title    : req.__('Create'),
              item_name: req.__('Notification Group / Create'),
              action   : 'create',
              url      : "/" + space + "/notification-group/create",
              row      : req.body,
              message  : err.msg,
            });
          }
        });
        
      } else {
        
        View.render('notification-groups/index').with(req, res, {
          title    : req.__('Create'),
          item_name: req.__('Notification Group / Create'),
          action   : 'create',
          url      : "/" + space + "/notification-group/create",
          row      : req.body,
          message  : err.msg,
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
            title    : req.__('Edit'),
            item_name: req.__('Notification Group / Edit'),
            action   : 'edit',
            row      : prof.rows[0],
            url      : "/" + space + "/notification-group/edit/" + req.params.id
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
              title    : req.__('Edit'),
              item_name: req.__('Notification Group / Edit'),
              action   : 'edit',
              message  : err.msg,
              row      : {
                name   : req.body.name ? req.body.name : '',
                country: req.body.country ? req.body.country : '',
                status : req.body.status ? req.body.status : 1
              },
              url      : "/" + space + "/notification-group/edit/" + req.params.id
            });
          }
        });
      } else {
        
        View.render('notification-groups/edit').with(req, res, {
          title    : req.__('Edit'),
          item_name: req.__('Notification Group / Edit'),
          action   : 'edit',
          row      : {
            name   : req.body.name ? req.body.name : '',
            country: req.body.country ? req.body.country : '',
            status : req.body.status ? req.body.status : 1
          },
          errors   : errors,
          url      : "/" + space + "/notification-group/edit/" + req.params.id
        });
      }
      
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get("/:space/notification-group/templates/:groupid", Auth.can('create_notification_groups'), function (req, res) {
    var group_id = req.params.groupid;
    View.checkAuthenticated(req).then(function (prof_id) {
      MessageTemplateService.loadTemplates({
        group_id: group_id,
        user_id : req.user.user_id
      }, function (err, templates) {
        View.render('notification-groups/message-templates').with(req, res, {
          title    : req.__('Message Templates'),
          group_id : group_id,
          data     : templates,
          can_add  : Auth.can('create_notification_groups'),
          can_edit : Auth.can('create_notification_groups'),
          item_name: req.__('Notification Group Message Templates')
        });
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get("/:space/notification-group/templates/:groupid/create", Auth.can('create_notification_groups'), function (req, res) {
    var group_id = req.params.groupid;
    View.checkAuthenticated(req).then(function (prof_id) {
      View.render('notification-groups/new-message-template').with(req, res, {
        title    : req.__('Message Templates'),
        group_id : group_id,
        row      : {
          title  : '',
          message: ''
        },
        action   : 'create',
        can_add  : Auth.can('create_notification_groups'),
        can_edit : Auth.can('create_notification_groups'),
        item_name: req.__('Notification Group Message / Create')
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.post("/:space/notification-group/templates/:groupid/create", Auth.can('create_notification_groups'), function (req, res) {
    var group_id = req.params.groupid;
    var space    = req.params.space;
    View.checkAuthenticated(req).then(function (prof_id) {
      req.assert('title', 'Name is required').notEmpty();
      req.assert('message', 'Message is required').notEmpty();
      var errors = req.validationErrors();
      if (!errors) {
        MessageTemplates.create(req.body).then(function () {
          res.redirect('/' + space + '/notification-group/templates/' + group_id);
        })
      } else {
        View.render('notification-groups/new-message-template').with(req, res, {
          title    : req.__('Message Templates'),
          group_id : group_id,
          row      : req.body,
          action   : 'create',
          errors   : errors,
          can_add  : Auth.can('create_notification_groups'),
          can_edit : Auth.can('create_notification_groups'),
          item_name: req.__('Notification Group Message / Create')
        });
      }
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get("/:space/notification-group/templates/:groupid/edit/:template", Auth.can('create_notification_groups'), function (req, res) {
    var group_id    = req.params.groupid;
    var template_id = req.params.template;
    View.checkAuthenticated(req).then(function (prof_id) {
      MessageTemplates.findOne({where: {id: template_id}}).then(function (template) {
        View.render('notification-groups/new-message-template').with(req, res, {
          title    : req.__('Message Templates'),
          group_id : group_id,
          row      : template.dataValues,
          can_add  : Auth.can('create_notification_groups'),
          can_edit : Auth.can('create_notification_groups'),
          item_name: req.__('Notification Group Message Templates')
        });
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.post("/:space/notification-group/templates/:groupid/edit/:template", Auth.can('create_notification_groups'), function (req, res) {
    var group_id    = req.params.groupid;
    var template_id = req.params.template;
    var space       = req.params.space;
    View.checkAuthenticated(req).then(function (prof_id) {
      req.assert('title', 'Name is required').notEmpty();
      req.assert('message', 'Message is required').notEmpty();
      var errors = req.validationErrors();
      if (!errors) {
        MessageTemplates.findOne({where: {id: template_id}}).then(function (row) {
          if (row) {
            row.updateAttributes(req.body);
          }
          res.redirect('/' + space + '/notification-group/templates/' + group_id);
        });
      } else {
        View.render('notification-groups/new-message-template').with(req, res, {
          title    : req.__('Message Templates'),
          group_id : group_id,
          row      : req.body,
          action   : 'create',
          errors   : errors,
          can_add  : Auth.can('create_notification_groups'),
          can_edit : Auth.can('create_notification_groups'),
          item_name: req.__('Notification Group Message / Create')
        });
      }
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  app.get("/:space/notification-group/templates/:groupid/delete/:template", Auth.can('create_notification_groups'), function (req, res) {
    var group_id    = req.params.groupid;
    var template_id = req.params.template;
    var space       = req.params.space;
    View.checkAuthenticated(req).then(function (prof_id) {
      MessageTemplates.destroy({where: {id: template_id}}).then(function (row) {
        res.redirect('/' + space + '/notification-group/templates/' + group_id);
      });
    }).catch(function (failed) {
      res.redirect('/login');
    });
  });
  
  var load_notification_group = function (req, callback) {
    var config = Config.defaults({
      space  : req.params.space,
      name   : 'notification-groups',
      filters: {
        id: req.params.id
      }
    });
    
    loader.load(app, config, function (err, data) {
      callback(err, data);
    });
  };
};