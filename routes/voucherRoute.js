
var voucher = require('../model/voucherModel.js');


exports.generatevoucher = function (req,res) {
	var email = req.body.email;
	var voucherPin = req.body.pin;
	var voucherAmount = req.body.amount;

	var insufficientData 	= new Array();


	if (email == "" || email == undefined || email == null) {

		insufficientData.push("Email is null")
	}

	if (voucherPin == "" || voucherPin == undefined || voucherPin == null || voucherPin.length != 5) {

		insufficientData.push("voucherPin is null")
	}

	if (voucherAmount == "" || voucherAmount == undefined || voucherAmount == null) {

		insufficientData.push("voucherAmount is null")
	}

	if (insufficientData.length == 0) {

		voucher.generatevoucher(email,voucherPin,voucherAmount,function (obj) {
			// body...
			res.send(obj);
		},function (obj) {
			// body...
			res.send(obj);
		})
	}else{
		res.send({"response":false, "responseString":"insufficientData","data":insufficientData});
	}
}

exports.redeemvoucher = function (req,res){
	var email = req.body.email;
	var voucherpin = req.body.pin;
	var voucherCode = req.body.voucherCode;
	var redeemAmount = req.body.redeemAmount;

	var insufficientData 	= new Array();

	if (email == "" || email == undefined || email == null) {

		insufficientData.push("Email is null")
	}

	if (voucherpin == "" || voucherpin == undefined || voucherpin == null || voucherpin.length != 5) {

		insufficientData.push("voucherpin is null")
	}

	if (voucherCode == "" || voucherCode == undefined || voucherCode == null) {

		insufficientData.push("voucherCode is null")
	}

	if (redeemAmount == "" || redeemAmount == undefined || redeemAmount == null) {

		insufficientData.push("redeemAmount is null")
	}

	if (insufficientData.length == 0) {

		voucher.redeemVoucher(email, voucherpin, voucherCode, redeemAmount, function (obj) {
			// body...
			res.send(obj);
		},function (obj) {
			// body...
			res.send(obj);
		})
	}else{
		res.send({"response":false, "responseString":"insufficientData","data":insufficientData});

	}
}


exports.filter_voucher = function (req,res){

	var from_date = req.body.from_date;
	var to_date = req.body.to_date;
	var status = req.body.status;
	var email = req.body.email;


	voucher.filter_voucher(from_date,to_date,status,email, function (obj) {
		// body...
		res.send(obj);
	},function (obj) {
		// body...
		res.send(obj);
	})
}