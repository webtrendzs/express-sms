module.exports.model = function(Sequelize, seq) {

    var Model = seq.define('tbl_outbox_message_queue', {

        id: { type: Sequelize.UUID, primaryKey: true, defaultValue: Sequelize.UUIDV1},

        msisdn: { type: Sequelize.STRING(15), allowNull: false },

        message: { type: Sequelize.TEXT, allowNull: false },
  
        debit_account_id: { type: Sequelize.INTEGER },

        status: { type: Sequelize.STRING(15), allowNull: false, defaultValue: 'NEW' },

        created_at: { type: Sequelize.DATE, allowNull: false, defaultValue: Sequelize.NOW },

        created_by: { type: Sequelize.STRING(15), allowNull: false, defaultValue: 'SYS' },

        updated_at: { type: Sequelize.DATE },

        deleted_at: { type: Sequelize.DATE }
    }, { tableName: 'tbl_outbox_message_queue' });

    return Model;
};