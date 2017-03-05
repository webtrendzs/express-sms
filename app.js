// Ensure we're in the project directory, so relative paths work as expected
// no matter where we actually starting from.
process.chdir(__dirname);

(function () {

    var app;

    try {

        app = require('./system/index');

    } catch (e) {

        throw Error(e);
    }

    // Start server
    app.start({},function (_app) {

    });


})();