module.exports.model = function(Sequelize, seq) {
	
	var NotificationGroup = seq.define('tbl_notificationgroup', {
		
		id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
				
		name: {type: Sequelize.STRING },

		country: {type: Sequelize.STRING },
		
		status: { type: Sequelize.INTEGER, defaultValue: 0 }
	});
	
	return NotificationGroup;
};