// var sendinblue = require('sendinblue-api');

var express      = require("express");
var bodyParser     = require('body-parser');
var mysql        = require('mysql');
var http       = require('http');
var config       = require('./config.js');



var connection     = mysql.createConnection(config.mysqlCon);
var port = config.ports.development;

var app = express();
var server = http.createServer(app).listen(port, function(){
  console.log("Express server listening on port " + port);
});


app.use(bodyParser.json({limit: '100Mb'})); // for parsing application/json
app.use(bodyParser.urlencoded({limit: '100Mb', extended: true })); // for parsing application/x-www-form-urlencoded

//Webmobi Api Service
app.get('/',function(req,res){
  console.log("Welcome to API Services");
  res.send("Welcome to API Services");
})

//Start Api
app.post('/api', function (req, res) {
  var name=req.body.s;
  res.send('Ecomm API is running');
});


var voucher = require('./routes/voucherRoute.js');

app.post('/api/generatevoucher',voucher.generatevoucher);
app.post('/api/redeemvoucher',voucher.redeemvoucher);
app.post('/api/filter_voucher',voucher.filter_voucher);


