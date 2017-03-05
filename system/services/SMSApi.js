exports.send = function(_to, message, callback){

    var querystring = require('querystring');
    var https = require('https');
    var api = Config.get('smsApi');
    var post_data = querystring.stringify({
        'username': api.username,
        'to': _to,
        'message': message
    });

    var post_options = {
        host: 'api.africastalking.com',
        path: '/version1/messaging',
        method: 'POST',

        rejectUnauthorized: false,
        requestCert: true,
        agent: false,

        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Content-Length': post_data.length,
            'Accept': 'application/json',
            'apikey': api.api_key
        }
    };

    var post_req = https.request(post_options, function (res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
            var jsObject = JSON.parse(chunk);
            var recipients = jsObject.SMSMessageData.Recipients;
            if (recipients.length > 0) {
                for (var i = 0; i < recipients.length; ++i) {

                    Message.create({msisdn: _to, message: message, status: 'Sent'}).then(function (result) {
                        callback(null, result);
                    }).catch(function (err) {
                        console.log(err);
                        callback(err, null);
                    });
                }
            } else {
                console.log('Error while sending: ' + jsObject.SMSMessageData.Message);
            }
        });
    });

    post_req.write(post_data);

    post_req.end();

};