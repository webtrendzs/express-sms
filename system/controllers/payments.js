module.exports.controller = function (app) {
  
  app.post("/:space/v1/payments/receive", function (req, res) {
    PaymentsApi.checkAuthenticated(req).then(function (prof_id) {
      var row = /*req.body || */{
          "account_id": req.body.account_id,
          "transactionId": "ATPid_TestTransaction123",
          "category": "MobileCheckout",
          "provider": "Mpesa",
          "providerRefId": "MpesaID001",
          "providerChannelCode": "525900",
          "productName": "My Online Store",
          "sourceType": "PhoneNumber",
          "source": "+2547724691181",
          "destinationType" : "Wallet",
          "destination": "PaymentWallet",
          "value": "KES 1000",
          "transactionFee": "KES 1.5",
          "providerFee": "KES 5.5",
          "status": "Success",
          "description": "Payment confirmed by mobile subscriber",
          "requestMetadata" : {
            "shopId" : "1234",
            "itemId" : "abcdef"
          },
          "providerMetadata" : {
            "KYCName" : "TestCustomer",
            "KYCLocation" : "Nairobi"
          },
          "transactionDate": "2016-07-10T15:12:05+03"
        };
      sequelize.transaction(function (t) {
        return SmsCreditTransactions.create(prepare_for_save(row), {transaction: t}).then(function (p) {
          return p;
        });
        
      }).catch(function (error) {
        return View.json(req, res, {
          err: error
        });
        
      }).then(function (_row) {
        SmsAccountTransactions.create({
          transaction_id    : _row.id,
          account_id        : _row.account_id,
          amount            : parseFloat(_row.transaction_value.replace('KES ', '')),
          transaction_type  : 'CR',
          reference         : -1,
          transaction_status: 'Success',
          transaction_date  : new Date()
        }).then(function(p){
          return View.json(req, res, _row);
        }).catch(function(err){
          return View.json(req, res, {
            err: err
          });
        });
        
      });
      
    }).catch(function (failed) {
      res.json({
        status: 'failed',
        message: 'Request could not be authenticated'
      });
    });
    
  });
  
  var prepare_for_save = function(data) {
    var _data = {};
    _.each(data, function(value, key) {
      if(key === 'value')
        key = 'transaction_value';
      if(key === 'transactionDate') {
        value = value.replace('T', ' ');
      } else if(key === 'status')
        key = 'transaction_status';
      _data[_.snakeCase(key)] = value;
    });
    return _data;
  };
  
};