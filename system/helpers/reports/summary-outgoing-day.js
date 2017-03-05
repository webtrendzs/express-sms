(function () {

    var _report = {
        sql: 'SELECT created_at::date,count(*) as sms_count FROM tbl_outbox_message {where} group by created_at::date',
        countSQL: '',
        where: '',
        orderBy: 'order by created_at::date DESC',
        preBuiltSQL: true,
        buildSQL: function (sql, config) {

            var where = Utils.createWhereSQLFromParams(sql, config)

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
            }
        ],
        columns: [
            {
                name: 'created_at',
                label: 'Sent Date',
                type:'date'
            },
            {
                name: 'sms_count',
                label: '# SMSes'
            }
        ],
        data_transformer: function (rows, config, callback) {

            var t_no_of_sms = 0, extra_data = {};

            for (var i = 0; i < rows.length; i++) {
                var row = rows[i];
                t_no_of_sms += parseInt(row.sms_count);
            }

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
                        value: t_no_of_sms,
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