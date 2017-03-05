module.exports.model = function(Sequelize, seq) {
	
	var NotificationGroupMember = seq.define('tbl_notificationgroupmember', {
		
		id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		
		group_id: {type: Sequelize.INTEGER },
		
		name: {type: Sequelize.STRING },
		
		phone: {type: Sequelize.STRING }
	});
	
	return NotificationGroupMember;
};