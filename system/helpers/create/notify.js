module.exports.notify = function (params, callback) {
  
  sequelize.transaction(function (t) {
    
    return Notification.create({
      groupid    : params.group,
      template_id: params.template_id
    }, {transaction: t}).then(function (notification) {
      callback(null, notification);
    }).catch(function (error) {
      callback(error, false);
    });
  });
};