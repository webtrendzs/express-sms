exports.send = function(type, msisdn, message, callback){

    msisdn = Utils.formatMsisdn(msisdn, 'KE');
    if(type === 'table') {
        SMSTable.send(msisdn, message, function(err, success) {
            callback(err, success);
        });
    } else {
        SMSApi.send(msisdn, message, function(err, success){
            callback(null, true);
        });
    }
};

exports.sendBulk = function(type, recipients, message, file, callback){

    var _msisdns=[];
    if (recipients.length > 0) {
        for (var i = 0; i < recipients.length; i++) {
            // avoid duplicates
            if(recipients[i] && recipients[i].length>0 && (_msisdns.indexOf(recipients[i]) === -1))
                _msisdns.push(Utils.formatMsisdn(recipients[i], 'KE'));
        }
    }

    if (_msisdns.length > 0) {
        if(type === 'table'){
            SMSTable.send(_msisdns, message, function(err, success) {
                callback(err, success);
            });

        } else {

            var q = async.queue(function (msisdn, cb) {
                SMSApi.send(msisdn, message, cb);
            }, 10);

            q.drain = function () {
                callback(null, true);
            };

            q.push(_msisdns, function (err, task) {});
        }
    } else {
        callback(null, true);
    }
};