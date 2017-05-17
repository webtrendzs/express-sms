exports.getTemplateAttributes = function(templateId){

};

exports.getTemplateAttributeValues = function(templateId, attributeId) {

};

exports.saveTemplateAttributes = function(group_id, url) {

    return new Promise(function(resolve, reject) {
        CsvParser.parse(url, group_id, function(err, success) {
            if(!err)
                resolve(success);
            else
                reject(err)
        });
    });
};