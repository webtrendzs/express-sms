(function () {

    var _report = {
        sql: 'SELECT * FROM tbl_inbox_message {where}',
        countSQL: '',
        where: '',
        orderBy: 'order by created_at DESC',
        preBuiltSQL: true,
        buildSQL: function (sql, config) {

            var where = Utils.createWhereSQLFromParams(sql, config);

            sql = sql.replace('{where}', where);

            return sql;

        },
        params: [
            {
                name: 'created',
                type: 'date',
                label: i18n.__('Date From'),
                is_from_date: true,
                value: '',
                sql: function (fromDate, toDate) {
                    return 'created_at::date between to_date(\'' + fromDate + '\', \'YYYY-MM-DD\') and to_date(\'' + toDate + '\', \'YYYY-MM-DD\')';
                }
            },
            {
                name: 'date_to',
                type: 'date',
                label: i18n.__('Date To'),
                is_to_date: true,
                value: ''
            },
            {
                name: 'msisdn',
                type: 'text',
                label: i18n.__('MSISDN'),
                value: '',
                sql: function (value) {
                    return 'msisdn::text like \'%' + value + '%\'';
                }
            },
            {
                name: 'step',
                type: 'select',
                label: i18n.__('Step'),
                value: '',
                values: [
                    {name: '', value: ''},
                    {name: 'Step 1', value: '1'},
                    {name: 'Step 2', value: '2'},
                    {name: 'Step 3', value: '3'},
                    {name: 'Step 4', value: '4'},
                    {name: 'Step 5', value: '5'},
                    {name: 'Step 6', value: '6'},
                    {name: 'Step 7', value: '7'},
                    {name: 'Step 8', value: '8'}
                ],
                sql: function (value) {
                    if (value != '')
                        return "data ->> 'message' = '"+ value +"'";
                    return '';
                }
            }
        ],
        columns: [
            {
                name: 'created_at',
                label: 'Date Received',
                type:'timestamp'
            },
            {
                name: 'msisdn',
                label: 'MSISDN'
            },
            {
                name: 'message',
                label: 'Message'
            }

        ],
        row_transformer: function(row){
            row.message = JSON.parse(JSON.stringify(row.data)).message;
        },
        data_transformer: function (rows, config, callback) {

            var extra_data = {};

            var before_table = {
                type: 'table',
                view: 'reports/before_table',
                columns: [
                    {
                        label: 'Key',
                        name: 'key'
                    },
                    {
                        label: 'Value',
                        name: 'value'
                    }
                ],
                rows: [
                    {
                        key: 'Total SMSes',
                        value: rows.count,
                        cssClass: 'before_table row_0'
                    }
                ],
                has_headers: true
            };

            extra_data.before_table = before_table;

            callback(null, {
                extra_data: extra_data,
                rows: rows
            });

        }
    };

    module.exports = _report;

})();