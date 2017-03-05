(function () {

    var dateFormat = require('dateformat');

    var _report = {
        sql: 'SELECT tblaudittrail.*, userfullname, username, useremail FROM tblaudittrail INNER JOIN sysusers ON tblaudittrail.userid = sysusers.user_id',
        orderBy: 'order by tblaudittrail.actiondate DESC',
        where: '',
        params: [
            {
                name: 'username',
                type: 'text',
                label: 'Username',
                value: '',
                sql: function (value) {
                    return "username like '%" + value + "%'";
                }
            }
        ],
        columns: [
            {
                name: 'actionType',
                label: 'Action'
            },
            {
                name: 'userfullname',
                label: 'Full Name'
            },
            {
                name: 'username',
                label: 'Username'
            },
            {
                name: 'useremail',
                label: 'User Email'
            },
            {
                name: 'oldValue',
                label: 'Old Value'
            },
            {
                name: 'newValue',
                label: 'New Value'
            },
            {
                name: 'actiondate',
                label: 'Action Date',
                type: 'date'
            }
        ]
    };

    module.exports = _report;

})();