module.exports.model = function(Sequelize, seq) {
	
	var Profile = seq.define('tblprofile', {
		
		prof_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		
		space: {type: Sequelize.STRING, defaultValue: 'cci' },
		
		prof_name: {type: Sequelize.STRING },
		
		group_id: {type: Sequelize.INTEGER },

		acl_index: {type: Sequelize.INTEGER },
		
		status_id: { type: Sequelize.INTEGER, defaultValue: 0 }
	});
	
	return Profile;
};