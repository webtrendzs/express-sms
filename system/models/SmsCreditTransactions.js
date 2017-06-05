module.exports.model = function (Sequelize, seq) {
  
  var CreditTransaction = seq.define('tbl_credit_transactions', {
    
    id                   : {
      type         : Sequelize.BIGINT,
      allowNull    : false,
      autoIncrement: true,
      primaryKey   : true
    },
    transaction_id       : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    account_id       : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    category             : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    provider             : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    provider_ref_id      : {
      type     : Sequelize.STRING,
      allowNull: true
    },
    provider_channel_code: {
      type     : Sequelize.STRING,
      allowNull: false
    },
    client_account       : {
      type     : Sequelize.STRING,
      allowNull: true
    },
    product_name         : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    source_type          : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    source               : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    destination_type     : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    destination          : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    transaction_value    : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    transaction_fee      : {
      type     : Sequelize.STRING,
      allowNull: true
    },
    provider_fee         : {
      type     : Sequelize.STRING,
      allowNull: true
    },
    transaction_status   : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    description          : {
      type     : Sequelize.TEXT,
      allowNull: false
    },
    request_metadata     : {
      type     : Sequelize.JSON,
      allowNull: false
    },
    provider_metadata    : {
      type     : Sequelize.JSON,
      allowNull: false
    },
    transaction_date     : {
      type     : Sequelize.DATE,
      allowNull: true
    }
  });
  
  return CreditTransaction;
};