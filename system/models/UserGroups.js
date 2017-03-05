module.exports.model = function(Sequelize, seq) {
	
	var UserGroup = seq.define('tblusergroups', {
		
		group_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
		
		name: {type: Sequelize.STRING }
	});
	
	return UserGroup;
};