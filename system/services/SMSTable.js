exports.send = function(_to, message, callback){

    if(_.isArray(_to)) {

        var queue = [];

        _.each(_to, function(recipient, index) {
            queue.push({
                message: message,
                msisdn: recipient
            });
        });

        sequelize.transaction(function (t) {

            return OutBoxQueue.bulkCreate(queue, {transaction: t}).then(function (p) {});

        }).then(function(p){
            callback(null, p);
        }).catch(function(err){
            callback(err, null);
        });

    } else {
        sequelize.transaction(function (t) {
            return OutBoxQueue.create({message: message, msisdn: _to}, {transaction: t}).then(function (p) {});
        }).then(function(p){
            callback(null, p);
        }).catch(function(err){
            callback(err, null);
        });
    }

};