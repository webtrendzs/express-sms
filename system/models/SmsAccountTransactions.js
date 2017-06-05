module.exports.model = function (Sequelize, seq) {
  
  var AccountTransaction = seq.define('tbl_account_credit_transactions', {
    
    id                : {
      type         : Sequelize.BIGINT,
      allowNull    : false,
      autoIncrement: true,
      primaryKey   : true
    },
    transaction_id    : {
      type     : Sequelize.BIGINT,
      allowNull: false
    },
    account_id        : {
      type     : Sequelize.INTEGER,
      allowNull: false
    },
    amount            : {
      type     : Sequelize.FLOAT,
      allowNull: false
    },
    transaction_type  : {
      type     : Sequelize.STRING,
      allowNull: false
    },
    reference         : {
      type     : Sequelize.BIGINT,
      allowNull: true
    },
    transaction_status: {
      type     : Sequelize.STRING,
      allowNull: false
    },
    transaction_date  : {
      type     : Sequelize.DATE,
      allowNull: true
    }
  });
  
  return AccountTransaction;
};