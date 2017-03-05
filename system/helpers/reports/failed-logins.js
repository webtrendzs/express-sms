(function () {

    var dateFormat = require('dateformat');

    var _report = {
        sql: 'SELECT logf_usrname, logf_ip, logf_reason, logf_date, logf_id FROM tbllogfailerror',
        countSQL: 'SELECT count(*) FROM tbllogfailerror',
        orderBy: 'order by logf_date DESC',
        where: '',
        params: [
            {
                name: 'date_from',
                type: 'date',
                label: 'Date From',
                is_from_date: true,
                link_col_index: 1,
                value: '',
                sql: function (fromDate, toDate) {
                    return "logf_date::date between to_date('" + fromDate + "', 'YYYY-MM-DD') and to_date('" + toDate + "', 'YYYY-MM-DD')";
                }
            },
            {
                name: 'date_to',
                type: 'date',
                label: 'Date To',
                is_to_date: true,
                value: ''
            },
            {
                name: 'logf_usrname',
                type: 'text',
                label: i18n.__('Username'),
                value: '',
                sql: function (value) {
                    return "logf_usrname like '%" + value + "%'";
                }
            }
        ],
        columns: [
            {
                name: 'logf_ip',
                label: 'Login IP'
            },
            {
                name: 'logf_usrname',
                label: 'Username'
            },
            {
                name: 'logf_reason',
                label: 'Reason'
            },
            {
                name: 'logf_date',
                label: 'Date'
            }
        ],
        row_transformer: function (row) {
            row.logf_date = dateFormat(row.logf_date, 'yyyy-mm-dd');
        }
    };

    module.exports = _report;

})();