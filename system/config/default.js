module.exports = {
    //defaults
    space: 'sms',
    app_name: 'sms',
    allowed_spaces:'(cci|sms)',
    client: 'Q-SMS',
    country_code:'254',
    company: 'SMS Technologies',
    i18n:{
        locales: ['en'],
        directory: __dirname + '/../helpers/locales',
        defaultLocale: 'en',
        updateFiles: false,
        cookie: 'locale'
    },
    acl_index: function (type) {

        if (type == 'asArray') {
            return [
                {index: 10, name: 'Super Admin'},
                {index: 9, name: 'Admin/Manager'},
                {index: 8, name: 'User'}
            ]
        } else {
            return {
                '10': 'Super Admin',
                '9': 'Admin/Manager',
                '8': 'User'
            }
        }

    }
};