(function () {

    var _report = {
        sql: 'SELECT * FROM tbl_outbox_message',
        countSQL: '',
        where: '',
        orderBy: 'order by created_at DESC',
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
            row.message = JSON.parse(JSON.stringify(row.message)).message;
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