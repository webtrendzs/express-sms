module.exports.model = function(Sequelize, seq) {
	
	var ProfilePermission = seq.define('tblprofilepermission', {
		
		per_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		
		profile_id: {type: Sequelize.INTEGER },
		
		name: {type: Sequelize.STRING }
	});
	
	return ProfilePermission;
};