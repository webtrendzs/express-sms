module.exports.model = function(Sequelize, seq) {

    var MessageTemplateAttributes = seq.define('tbl_message_template_attributes', {

        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

        group_id: {type: Sequelize.INTEGER },

        template_id: {type: Sequelize.INTEGER },

        attribute_name: {type: Sequelize.STRING }
    });

    return MessageTemplateAttributes;
};