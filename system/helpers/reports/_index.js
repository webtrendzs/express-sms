(function (seq) {

    var dateFormat = require('dateformat');

    function Report(config) {

        config = config || {};
        //report interface
        var _default = {
            sql: '',
            where: '',
            view: 'reports/index',
            action_buttons: [],
            /*
             There are exceptional cases where sequelize returns wrong data for a given raw query.
             In such case set libMode=true to the config of the report involved. pg module returns the right result;
             */
            libMode: false,
            orderBy: false,
            buildSQL: function (sql, config) {
                return sql;
            },
            params: [],
            columns: [],
            row_transformer: function (row) {
            },
            data_transformer: function (rows, config, callback) {
                callback(null, rows);
            },
            generate: function (callback) {

                var name = config.name;

                var response = {};

                if (this.action_buttons)
                    response.action_buttons = this.action_buttons;

                if (this.view)
                    response.view = this.view;

                if (config.space)
                    space = config.space;

                var p_config = config.pagination;

                var limit = p_config.limit;

                var offset = p_config.offset;
                var page = p_config.page;

                if (page <= 0)
                    page = 1;

                if (this.preBuiltSQL) {
                    this.sql = this.buildSQL(this.sql, config);
                }

                this.sql = fromWhere(this, this.where, config);

                if (this.groupBy)
                    this.sql += ' ' + this.groupBy;

                if (this.orderBy)
                    this.sql += ' ' + this.orderBy;

                var start = (page - 1) * offset;
                var that = this;
                load_data(this.sql, {
                    start: start,
                    limit: offset,
                    report: name,
                    hasFilter: !_.isEmpty(config.request_filters),
                    paginate: p_config.paginate,
                    libMode: config.libMode || false
                }, function (err, rows) {

                    for (var i = 0; i < rows.length; i++) {

                        that.row_transformer(rows[i]);

                        for (var c = 0; c < that.columns.length; c++) {
                            var col = that.columns[c];

                            if(col.type){
                                switch(col.type) {
                                    case "float":

                                        rows[i][col.name]=Utils.floatNumber(rows[i][col.name]);

                                        break;
                                    case "timestamp":
                                        format_date(rows[i], col.name);
                                        break;
                                    case "date":
                                        format_date_without_time(rows[i], col.name);
                                        break;
                                }
                            }
                        }
                    }

                    _.extend(response, {
                        rows: rows,
                        total: rows.count ? rows.count : rows.length,
                        offset: start,
                        limit: offset,
                        page: page,
                        viewOptions:that.viewOptions || {}, /* used to configure date filter and other options */
                        columns: that.columns,
                        params: setParams(that.params, config)
                    });

                    if (that.hasOwnProperty('data_transformer')) {

                        that.data_transformer(rows, config, function (err, _res) {
                            if (_res.extra_data) {
                                response.rows = _res.rows;
                                response.extra_data = _res.extra_data;
                            } else
                                response.rows = _res;

                            if (that.hasOwnProperty('filter_values')) {
                                that.filter_values(function (err, filter_values) {
                                    response.filter_values = filter_values;
                                });
                            }

                            callback(null, response);
                        });

                    } else {
                        if (that.hasOwnProperty('filter_values')) {
                            that.filter_values(function (err, filter_values) {
                                response.filter_values = filter_values;
                            });
                        }

                        callback(null, response);
                    }


                });
            }
        };

        _.merge(_default, config);

        return _default;

    }

    var fromWhere = function (report, where, config) {

        var sql = report.sql;

        if (config.buildSQL && !_.isEmpty(config.request_filters)) {

            return report.buildSQL(sql, config);

        }

        where = where || '';

        where = where.trim();

        if (config.filters) {

            var filters = config.filters;

            for (var p in filters) {
                if (filters.hasOwnProperty(p)) {
                    where += where.length > 0 ? ' and ' + p + '=' + filters[p] : 'where ' + p + '=' + filters[p];
                }
            }
        }

        where += Utils.createWhereSQLFromParams(sql, config);

        return sql.indexOf('{where}')!=-1? sql.replace('{where}',where) : sql+" "+ where;
    };

    var setParams = function (params, config) {
        if (params && config.params) {
            for (var i = 0; i < params.length; i++) {
                for (var pr in config.params) {
                    if (config.params.hasOwnProperty(pr)) {
                        var row = params[i];
                        if (row.name === pr) {
                            row.value = config.params[pr];
                        }
                    }
                }
            }
        }
        return params;
    };

    var format_date = function (row, field) {
        if (row[field])
            row[field] = dateFormat(row[field], "yyyy-mm-dd HH:MM:ss");
    };

    var format_date_without_time = function (row, field) {
        if (row[field])
            row[field] = dateFormat(row[field], "yyyy-mm-dd");
    };

    var load_data = function (sql, params, callback) {

        if (!params.paginate){
            delete params.limit;
            delete params.start;
        }

        load_count(params, sql, function (err, count) {

            if (err) {
                return callback(err, null);
            }

            params['count'] = count;

            return query(sql, params, callback);

        });
    };

    var query = function (sql, params, callback) {

        if (params.limit && !isNaN(params.limit))
            sql += ' limit ' + params.limit;

        if (params.start && !isNaN(params.start))
            sql += ' offset ' + params.start;

        seq.query(sql, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

            if (params.count)
                data['count'] = params.count;

            callback(null, data);

        }).catch(function (err) {
            Utils.log(err);
            callback(err, null);
        });


    };

    var load_count = function (params, sql, callback) {

        var last_count = 0;

        if (params.hasFilter) {

            var c_sql = 'select count(*) from (' + sql + ') as count';

            seq.query(c_sql, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

                return callback(null, ((data[0] && data[0].count) ? data[0].count : 0));

            }).catch(function (err) {

                console.log(err);

                throw new Error();

            });

        } else {

            seq.transaction(function (t) {

                return Pagination.find({where: {report: params.report}}, {transaction: t}).then(function (row) {

                    //update cache if exists
                    if (row) {

                        last_count = row.last_count;
                        //check if we have more records than last count limit one is enough to tell us there are some records
                        return seq.query(sql + ' limit 1 offset ' + last_count, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

                            var offsetcount = (data && data[0] != undefined) ? data.length : 0;

                            // if so get all the records after last count and update the cache
                            if (offsetcount > 0) {

                                sql += ' offset ' + last_count;

                                var _sql = 'select count(*) from (' + sql + ') as count';

                                return seq.query(_sql, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

                                    var count = (data[0] && data[0].count) ? data[0].count : 0;

                                    return row.updateAttributes({last_count: parseInt(last_count, 10) + parseInt(count, 10)}, {transaction: t}).then(function (res) {

                                        return (parseInt(last_count, 10) + parseInt(count, 10));

                                    }).catch(function (error) {

                                        Utils.log(error);

                                        throw new Error();

                                    });

                                }).catch(function (err) {

                                    Utils.log(err);

                                    throw new Error();

                                });

                            }
                            else {
                                return last_count;
                            }

                        }).catch(function (err) {

                            Utils.log(err);

                            throw new Error();
                        });

                    }
                    //no cache,create
                    else {

                        var _sql = 'select count(*) from (' + sql + ') as count';

                        return seq.query(_sql, {type: Sequelize.QueryTypes.SELECT}).then(function (data) {

                            var count = (data[0] && data[0].count) ? data[0].count : 0;

                            return Pagination.create({
                                report: params.report,
                                last_count: count
                            }, {transaction: t}).then(function (p) {

                                return count;

                            }).catch(function (error) {

                                Utils.log(error);

                                throw new Error();

                            });

                        }).catch(function (err) {

                            Utils.log(err);

                            throw new Error();

                        });

                    }

                }).catch(function (error) {

                    Utils.log(error);

                    throw new Error();

                });


            }).then(function (result) {

                callback(null, result);

            }).catch(function (err) {
                Utils.log(err);
                callback(err, null);
            });
        }

    };

    module.exports = Report;

})(sequelize);