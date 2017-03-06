# express-sms

A simple express application to send and monitor SMSes through an interface

Requirements:

- Postgres
- Redis
- Node.js

How to run.

`npm install`

Change `forceSync` under `db.options` in `/system/config/development.js` to create the db

`node app.js`

If you have forever module installed globally, run `forever start app.js`