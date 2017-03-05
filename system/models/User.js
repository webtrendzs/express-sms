module.exports.model = function(Sequelize, seq) {
	
	var User = seq.define('sysusers', {
		
		user_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true},
		
		userfullname: {type: Sequelize.STRING },
		
		username: { type: Sequelize.STRING },
		
		userpass: { type: Sequelize.STRING },
		
		useremail: { type: Sequelize.STRING },		
		
		userphone: { type: Sequelize.STRING },
		
		prof_id: { type: Sequelize.INTEGER }, //cci profile id
		
		login_tries: { type: Sequelize.INTEGER },
		
		last_password_changed : {type: Sequelize.DATE },
		
		user_lang: { type: Sequelize.STRING },
		
		emp_id: { type: Sequelize.INTEGER },
		
		user_pic: { type: Sequelize.STRING },
		
		prt_id: { type: Sequelize.INTEGER },
		
		adp_id: { type: Sequelize.INTEGER }, //adis profile id
		
		prft_id: { type: Sequelize.INTEGER },
		
		status_id: { type: Sequelize.INTEGER },
		
		is_agent: { type: Sequelize.BOOLEAN }
	});
	
	return User;
};