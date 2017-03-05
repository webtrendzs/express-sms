(function () {

    var _report = {
        sql: 'SELECT to_char(created_at,\'YYYY-MM\') as created,count(*) as sms_count FROM tbl_outbox_message {where} group by to_char(created_at,\'YYYY-MM\')',
        countSQL: '',
        where: '',
        orderBy: 'order by to_char(created_at,\'YYYY-MM\') DESC',
        viewOptions:{
            datefilter:{
                format: "yyyy-mm",
                startView: "months",
                minViewMode: "months"
            }
        },
        preBuiltSQL: true,
        buildSQL: function (sql, config) {

            var params = config.request_filters;

            var where = '';

            if (!_.isEmpty(params))
                where = "where to_char(created_at,\'YYYY-MM\') =to_char( to_date('" + params.created + "', 'YYYY-MM-DD'),\'YYYY-MM\')";

            sql = sql.replace('{where}', where);

            return sql;

        },
        params: [
            {
                name: 'created',
                type: 'date',
                label: i18n.__('Date'),
                value: '',
                sql: function (value) {
                    return "to_char(created_at,\'YYYY-MM\') = '" + value + "'";
                }
            }
        ],
        columns: [
            {
                name: 'created',
                label: 'Sent Month'
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