module.exports.controller = function(app) {

	var load = function(req, res, errors, message) {

		View.checkAuthenticated(req).then(function (prof_id) {

			var space = req.params.space;

			var config = Config.defaults({
				space: space,
				name: 'notification-groups'
			});

			Loader.load(config, function (err, data) {

				View.render('notifications/notify').with(req, res, {
					rows: data.rows,
					data: {group: '', message: ''},
					item_name: req.__('Notify'),
					errors: errors,
					message: message
				});
			});

		}).catch(function (failed) {

			res.redirect('/login');

		});
	};

	app.get('/:space/notification/groups', Auth.can('view_notification_groups'), function (req, res) {

		var space = req.params.space;

		View.checkAuthenticated(req).then(function (prof_id) {

			var config = Config.defaults({
				space: space,
				name: 'notification-groups'
			});

			Loader.load(config, function (err, data) {
				View.render('notification-groups/index').with(req, res, {
					data: data,
					item_name: req.__('Notification Group'),
					can_edit: Auth.has_permission(req, 'view_notification_groups'),
					can_add: Auth.has_permission(req, 'view_notification_groups')
				});
			});

		}).catch(function (failed) {
			res.redirect('/login');
		});
	});

	app.get("/:space/notification/notify", Auth.can('can_notify_users'), function(req, res) {
		load(req, res, null);
	});
	
	app.post("/:space/notification/notify", Auth.can('can_notify_users'), function(req, res) {

		View.checkAuthenticated(req).then(function (prof_id) {

			req.assert('group', 'Group is required').notEmpty();
			req.assert('message', 'Message is required').notEmpty();

			var errors = req.validationErrors();

			if(!errors) {

				require(__dirname + '/../helpers/create/notify.js').notify(req.body, function(err, result) {
					if(!err) {
						res.redirect('/'+ req.params.space+'/notification/approve');
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

	app.get("/:space/notification/approve", Auth.can('view_notifications'), function(req, res) {

		View.checkAuthenticated(req).then(function (prof_id) {

			var config = Config.with({
				name: 'notifications'
			});

			Loader.load(config, function (err, data) {

				View.render('notifications/index').with(req, res, {
					data: data,
					item_name: req.__('Notifications'),
					can_add: Auth.has_permission(req, 'view_notification_groups'),
					can_approve: Auth.has_permission(req, 'can_approve_sms')
				});
			});

		}).catch(function (failed) {

			res.redirect('/login');

		});
	});

	app.get("/:space/notification/:action/:notification_id", Auth.can('can_notify_users'), function(req, res) {

		View.checkAuthenticated(req).then(function (prof_id) {

			Notification.findOne({ where: { id: req.params.notification_id}}).then(function(notification){

				if(notification){
					NotificationGroupMember.findAll({where: {group_id: notification.groupid}, attributes: ['phone']}).then(function(members){

						if(members) {
							var _members = [];
							_.each(members, function(member) {
								_members.push(member.phone);
							});
							SMS.sendBulk('table', _members, notification.message, false, function(err, success) {

								notification.updateAttributes({approved: true});

								res.redirect('/'+ req.params.space +'/notification/approve');
							});
						}
					});
				}
			});

		}).catch(function (failed) {

			res.redirect('/login');

		});
	});
};