module.exports.model = function(Sequelize, seq) {

    var MessageTemplates = seq.define('tbl_message_templates', {

        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

        group_id: {type: Sequelize.INTEGER },

        title: {type: Sequelize.STRING },

        message: {type: Sequelize.TEXT }
    });

    return MessageTemplates;
};