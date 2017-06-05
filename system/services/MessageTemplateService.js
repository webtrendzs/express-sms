exports.getTemplateAttributes = function(templateId){

};

exports.getTemplateAttributeValues = function(templateId, attributeId) {

};

exports.saveTemplateAttributes = function(params, url) {

    return new Promise(function(resolve, reject) {
        CsvParser.parse(url, params.groupid, function(err, success) {
            if(!err)
                resolve(success);
            else
                reject(err)
        });
    });
};

exports.loadTemplates = function (params, callback) {
  var sql = "select * from tbl_message_templates a where group_id in (select id from" +
    " tbl_notificationgroups where account_id = " + params.user_id + ") {and} order by a.title" +
    " asc";
  
  var $and = '';
  
  if(params.group_id) {
    $and +='and a.group_id='+params.group_id;
  }
  
  sql = sql.replace('{and}', $and);
  
  sequelize.query(sql, {type: Sequelize.QueryTypes.SELECT}).then(function (templates) {
    callback(null, templates);
  });
};