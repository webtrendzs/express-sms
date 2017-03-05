module.exports.model = function(Sequelize, seq) {

    var Pagination = seq.define('tblpagination', {

        report_id: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },

        report: {type: Sequelize.STRING },

        last_count: {type: Sequelize.INTEGER}
    });

    return Pagination;
};