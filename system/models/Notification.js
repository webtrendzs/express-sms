module.exports.model = function(Sequelize, seq) {
	
	var Notification = seq.define('tbl_group_notification', {
		
		id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
				
		groupid: {type: Sequelize.INTEGER },

		approved: {type: Sequelize.BOOLEAN },
		
		message: { type: Sequelize.STRING }
	});
	
	return Notification;
};