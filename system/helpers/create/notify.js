module.exports.notify = function(params, callback) {
	
	sequelize.transaction(function(t) {
		
		return Notification.create({ groupid: params.group, message: params.message }, { transaction: t }).then(function(notification){
			callback(null, notification);
		}).catch(function (error) {
            	callback(error, false);
        });
	});
};