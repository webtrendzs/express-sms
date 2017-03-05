(function () {

    var dateFormat = require('dateformat');

    var _report = {
        sql: 'SELECT ses_ondte, ses_onuserip, ses_offdte, ses_offuserip, ses_status, ses_id, ses_adminip, sysusers.userfullname userfullname, sysusers.username AS username FROM tblusersessions INNER JOIN sysusers ON tblusersessions.ses_user = sysusers.user_id',
        countSQL: '',
        where: '',
        orderBy: 'order by ses_ondte DESC, ses_offdte DESC',
        view: 'sessions/index',
        params: [
            {
                name: 'username',
                type: 'text',
                label: 'Username',
                value: '',
                sql: function (value) {
                    var q = "ses_user in (select user_id from sysusers where username ilike '%:value%')";
                    return q.replace(':value', value);
                }
            },
            {
                name: 'status',
                type: 'select',
                label: 'Status',
                value: '',
                values: [
                    {name: '', value: ''},
                    {name: 'Active', value: '1'},
                    {name: 'In-Active', value: '0'},
                ],
                sql: function (value) {
                    return "ses_status=" + value;
                }
            }
        ],
        columns: [
            {
                name: 'userfullname',
                label: 'Full Name'
            },
            {
                name: 'username',
                label: 'Username'
            },
            {
                name: 'ses_status',
                label: 'Status'
            },
            {
                name: 'ses_onuserip',
                label: 'Active IP'
            },
            {
                name: 'ses_offuserip',
                label: 'Off IP'
            },
            {
                name: 'ses_ondte',
                label: 'Date/Time[Active]',
                type: 'date'
            },
            {
                name: 'ses_offdte',
                label: 'Date/Time[Off]',
                type: 'date'
            }
        ],
        row_transformer: function (row) {

            row.is_active = row.ses_status == 1;
            if (row.ses_status)
                row.ses_status = 'Active';
            else
                row.ses_status = 'In-Active';
        },
        data_transformer: function (rows, config, callback) {
            for (var i = 0; i < rows.length; i++) {

                var row = rows[i];
                //row.ses_status = !row.ses_offdte;
            }

            callback(null, rows);
        }
    };

    module.exports = _report;

})();