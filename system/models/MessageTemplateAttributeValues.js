module.exports.model = function(Sequelize, seq) {

    var MessageTemplateAttributeValues = seq.define('tbl_message_template_attribute_values', {

        id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

        group_id: {type: Sequelize.INTEGER },

        attribute_id: {type: Sequelize.INTEGER },

        attribute_value: {type: Sequelize.STRING }
    });

    return MessageTemplateAttributeValues;
};