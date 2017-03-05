module.exports.model = function(Sequelize, seq) {
	
	var Model = seq.define('tbl_messages', {
		
		id: { type: Sequelize.BIGINT, primaryKey: true, autoIncrement: true },
		
		msisdn: { type: Sequelize.STRING(15), allowNull: false },
		
		message: { type: Sequelize.TEXT, allowNull: false },

		status: { type: Sequelize.STRING(15), allowNull: false },
		 
		createdAt: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
		
		updatedAt: { type: Sequelize.DATE }
	});
	
	return Model;
};