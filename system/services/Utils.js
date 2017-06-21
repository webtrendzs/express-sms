var dateFormat = require('dateformat');
var phoneUtils = require('node-phonenumber');

exports.floatNumber = function (number, prefix) {

    number = parseFloat(number).toFixed(2);

    var thousands = number.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");

    if (prefix) {
        return prefix + " " + thousands;
    } else
        return thousands;
};

exports.encryptPassword = function (_pass) {
    var sha1 = require('sha1');
    var sha256 = require('sha256');
    var salt = Config.get('salt');
    return sha1(sha256(_pass + salt));
};

exports.log = function (data,type,req) {

    if(!Config.get('logErrors'))
        return;

    type=type || 'console';

    var _this=this,max_log_counter=0;

    if(type=='console'){

        console.log('--------------------------');
        console.log(data);
        console.log('--------------------------');

    }else{

        //TODO
        // log to db
    }

};

exports.ucasefirst = function (str) {

    return str.charAt(0).toUpperCase() + str.slice(1);

};

exports.sanitizeMSISDN = function (msisdn) {

    if (!msisdn.match(/\b\+254/))
        msisdn = Config.get('country_code') + msisdn.replace(/\b0/,'');


    return msisdn.trim();

};

exports.formatMsisdn = function(msisdn,country) {

    try {

        var phoneUtil = phoneUtils.PhoneNumberUtil.getInstance();
        var phoneNumber = phoneUtil.parse(msisdn,country);

        var toNumber = phoneUtil.format(phoneNumber, phoneUtils.PhoneNumberFormat.INTERNATIONAL);

        toNumber = toNumber.replace('+', '');
        toNumber = toNumber.replace(/ /g, '');

        return toNumber;
    } catch (e) {

        return msisdn;
    }
};

exports.createWhereSQLFromParams = function(sql, config){

    var where = '';

    if (config.params && !_.isEmpty(config.request_filters)) {

        var params = config.request_filters;

        for (var i = 0; i < config.params.length; i++) {

            for (var pr in params) {

                if (params.hasOwnProperty(pr)) {

                    var row = config.params[i];

                    if (row.name === pr) {

                        if (params[pr] && params[pr].length > 0) {

                            if (row.type && row.type === 'date' && row.is_from_date) {

                                var toRow = config.params[i + 1];

                                var fromDate = params[pr];
                                var toDate = params[toRow.name];

                                if ((fromDate == '' | fromDate == null) && toDate.length > 0) {
                                    fromDate = toDate;
                                } else if ((toDate == '' | toDate == null) && fromDate.length > 0) {
                                    toDate = dateFormat(new Date(), "yyyy-mm-dd");
                                }

                                if (row.hasOwnProperty('sql')) {
                                    var _sql = row.sql(fromDate, toDate);
                                    where += where.length > 0 ? ' and ' + _sql : 'where ' + _sql;
                                }

                            } else {
                                if (row.hasOwnProperty('sql')) {
                                    var _sql = row.sql(params[pr]);
                                    where += where.length > 0 ? ' and ' + _sql : 'where ' + _sql;
                                }
                            }
                        }
                    }
                }

            }
        }

    }

    return where;

};

exports.isValidMsisdn = function(value,country) {

    if(value) {

        try {

            var phoneUtil = phoneUtils.PhoneNumberUtil.getInstance();
            var phoneNumber = phoneUtil.parse(value,country);
            return phoneUtil.isValidNumber(phoneNumber);

        } catch (e) {
            return false;
        }
    }

    return false;
};

exports.promise=function(err,response){

    return new Promise(function (resolve, reject) {

        if (!err)
            return resolve(response);
        else
            return reject(err);
    });

};

exports.stringify = function (obj, _is_attributes) {

    var str_attr = ' ';

    _.each(obj.attributes, function (val, key) {

        var attr = val;

        if (typeof val === 'object') {
            attr = ' ' + _.keys(val) + '="' + val[_.keys(val)] + '"';
        }

        str_attr += attr;

    });

    return str_attr;
};
