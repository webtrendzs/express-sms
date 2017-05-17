exports.parse = function (inputFile, group_id, callback) {
    var fs = require('fs');
    var parse = require('csv-parse');
    var async = require('async');

    var parser = parse({delimiter: ',', columns: true}, function (err, data) {
        var attributes = _.keys(_.first(data));
        var save = [];
        _.each(attributes, function (attribute) {
            save.push({group_id: group_id, attribute_name: attribute});
        });
        MessageTemplateAttributes.destroy({where: {group_id: group_id}}).then(function () {
            MessageTemplateAttributes.bulkCreate(save).then(function (_attributes) {
                MessageTemplateAttributes.findAll({where: {group_id: group_id}})
                    .then(function (_attributes) {
                        var lines = [];
                        _.each(data, function (line) {
                            _.each(_attributes, function (attribute) {
                                lines.push({
                                    group_id: group_id,
                                    attribute_id: attribute.id,
                                    attribute_value: line[attribute.attribute_name]
                                });
                            });
                        });
                        MessageTemplateAttributeValues.destroy({where: {group_id: group_id}}).then(function () {
                            MessageTemplateAttributeValues.bulkCreate(lines).then(function () {
                                callback(null, true);
                            });
                        });
                    });
            }).catch(function (err) {
                callback(err, null);
            });
        });
    });

    fs.createReadStream(inputFile).pipe(parser);
};