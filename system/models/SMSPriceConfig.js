module.exports.model = function(Sequelize, seq) {
  
  var SMSPriceConfig = seq.define('tbl_sms_prices', {
    
    id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},
    
    price: { type: Sequelize.FLOAT, allowNull: false },
    
    account_id: { type: Sequelize.INTEGER },
    
    status: { type: Sequelize.STRING(15), allowNull: false, defaultValue: 'Active' },
    
    created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },
    
    updated_at: { type: Sequelize.DATE },
    
    deleted_at: { type: Sequelize.DATE }
  });
  
  return SMSPriceConfig;
};