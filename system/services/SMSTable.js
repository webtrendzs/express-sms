exports.send = function (config, callback) {
  var queue = [];
  
  _.each(config.recipients, function (recipient, index) {
    queue.push({
      message         : config.message,
      debit_account_id: config.account_id,
      msisdn          : recipient
    });
  });
  
  sequelize.transaction(function (t) {
    return OutBoxQueue.bulkCreate(queue, {transaction: t}).then(function (p) {
    });
    
  }).then(function (p) {
    callback(null, p);
  }).catch(function (err) {
    callback(err, null);
  });
};