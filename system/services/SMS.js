exports.config = {
  type      : 'table', // default sending method
  recipients: [],
  message: '',
  fromFile: false
};

exports.configure = function (config) {
  _.merge(this.config, config);
  
  if((_.isArray(this.config.recipients) && this.config.recipients.length === 0) ||
    (!_.isArray(this.config.recipients) && this.config.recipients === '') ||
    (this.config.message === '')) {
    return Utils.promise(new Error('At least one recipient and a message is required'), null);
  }
  
  return Utils.promise(null, this.config);
};

exports.send = function (type, msisdn, message, callback) {
  
  this.config.recipients.push(Utils.formatMsisdn(_.last(this.config.recipients), 'KE'));
  
  if (this.config.type === 'table') {
    SMSTable.send(this.config, function (err, success) {
      callback(err, success);
    });
  } else {
    SMSApi.send(this.config, function (err, success) {
      callback(null, true);
    });
  }
};

exports.sendBulk = function (callback) {
  
  var _msisdns   = [];
  var recipients = this.config.recipients;
  if (recipients.length > 0) {
    for (var i = 0; i < recipients.length; i++) {
      // avoid duplicates
      if (recipients[i] && recipients[i].length > 0 && (_msisdns.indexOf(recipients[i]) === -1))
        _msisdns.push(Utils.formatMsisdn(recipients[i], 'KE'));
    }
  }
  
  if (_msisdns.length > 0) {
    if (this.config.type === 'table') {
      SMSTable.send(this.config, function (err, success) {
        callback(err, success);
      });
      
    } else {
      
      var q = async.queue(function (msisdn, cb) {
        this.config.recipients.push(msisdn);
        SMSApi.send(this.config, cb);
      }, 10);
      
      q.drain = function () {
        callback(null, true);
      };
      
      q.push(_msisdns, function (err, task) {
      });
    }
  } else {
    callback(null, true);
  }
};