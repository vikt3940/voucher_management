
var mysql = require('mysql');
var config       = require('../config.js');
var con     = mysql.createConnection(config.mysqlCon);
var moment  = require('moment');
var sha1  = require('sha1');

function generateRandomVoucherCode() {
 	
 	function s4() {
        return Math.floor((1 + Math.random()) * 0x100000).toString(16).substring(1);
    }

    return 'VCD'+ s4() + s4() ;
}

exports.generatevoucher = function (email, voucherPin, voucherAmount ,callbackSucess ,callbackError) {
	// body...
	var voucherCode = generateRandomVoucherCode().toUpperCase();
	var createdAt = moment().format("YYYY-MM-DD HH:mm:ss")
	var expiryDate = moment((createdAt)).add(24, 'hours').format("YYYY-MM-DD HH:mm:ss");
	var insertQuery = "insert into voucher_detail (email, pin, voucherCode, voucherAmount, createdAt, expiryDate, status, availableAmount) values(? ,?, ?, ?, ?, ?, ?, ?)";
	con.query(insertQuery, [email, sha1(voucherPin), voucherCode, voucherAmount , createdAt, expiryDate, "active", voucherAmount], function (err,res) {
		// body...
		if (err) {
			console.log("generatevoucher insertQuery err",err);
			callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
		}else{
			var insertQuery1 = "insert into user_activity(email,voucherCode,status,activityDate,amount) values(?, ?, ?, ?, ?)";
			con.query(insertQuery1,[email,voucherCode,'generate',createdAt,voucherAmount],function (err1,res1) {
				if (err1) {
					console.log("generatevoucher insertQuery1 err",err1);
					callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
				}else{
					console.log("Voucher Generated Successfully");
					var voucherDetail = {};
					voucherDetail.email = email;
					voucherDetail.voucherCode = voucherCode;
					var sendEmail = false;
					if (sendEmail) {
						sendEmail(email);
						callbackError({"response":true,"responseString":"Voucher Generated Successfully","data":voucherDetail});
					}else{
						callbackError({"response":true,"responseString":"Voucher Generated Successfully","data":voucherDetail});
					}
				}
			})
		}
	})
}

exports.redeemVoucher = function(email,pin,voucherCode,redeemAmount,callbackSucess,callbackError){
	var selectQuery = "select * from voucher_detail where email = ? and pin = ? and status = 'active' and availableAmount <> 0";
	con.query(selectQuery,[email,sha1(pin)],function(err,res){
		// console.log(this.sql);
		if (err) {
			console.log("redeemVoucher selectQuery err",err);
			callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
		}else{
			if (res.length == 0) {
				console.log("No active Voucher ",email);
				callbackSucess({"response":true,"responseString":"No Active Voucher Available on this Account or Email"});
			}else{
				if (moment(res[0].expiryDate) <= moment().format("YYYY-MM-DD, h:mm:ss a") ) {
					console.log("Voucher Code Expire ",email);
					callbackSucess({"response":true,"responseString":"Voucher Code Expire"});	
				}else{
					if (res[0].availableAmount-parseInt(redeemAmount) < 0) {
						console.log("Redeem Amount Invalid",email);
						callbackSucess({"response":true,"responseString":"Redeem Amount Invalid","availableAmount":res[0].availableAmount});	
					}else{
						var selectQuery1 = "select count(*) as count from user_activity where email = ? and voucherCode = ? and status ='redeem'";
						con.query(selectQuery1,[email,voucherCode],function (err1,res1) {
							// body...
							if (err1) {
								console.log("redeemVoucher selectQuery err",err1);
								callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
							}else{
								if (res1.length != 0 && res1[0].count >= 5) {
									console.log("Redeem Limit Over ",email);
									callbackSucess({"response":true,"responseString":"Redeem Limit Over"});
								}else{
									var new_availableAmount = res[0].availableAmount-parseInt(redeemAmount);
									var status = new_availableAmount == 0?"inactive":"active";

									var updateQuery = "update voucher_detail set availableAmount = ?,status = ? where email = ? and voucherCode = ? ";
									con.query(updateQuery,[new_availableAmount,status,email,voucherCode],function (err2,res2) {
										if (err2) {
											console.log("redeemVoucher selectQuery err",err);
											callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
										}else{
											var activityDate = moment().format("YYYY-MM-DD, HH:mm:ss")
											var insertQuery1 = "insert into user_activity(email,voucherCode,status,activityDate,amount) values(?, ?, ?, ?, ?)";
											con.query(insertQuery1,[email,voucherCode,'redeem',activityDate,redeemAmount],function (err1,res1) {
												if (err1) {
													console.log("generatevoucher insertQuery1 err",err1);
													callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});
												}else{
													console.log("Voucher Code Redeem Successfully",email,voucherCode);
													var voucherDetail = {};
													voucherDetail.email = email;
													voucherDetail.voucherCode = voucherCode;
													voucherDetail.redeemAmount = redeemAmount;
													voucherDetail.availableAmount = new_availableAmount;
													sendEmail = false;
													if (sendEmail) {
														sendEmail(email);
														callbackSucess({"response":true,"responseString":"Voucher Code Redeem Successfully","data":voucherDetail});
													}else{
														callbackSucess({"response":true,"responseString":"Voucher Code Redeem Successfully","data":voucherDetail});
													}
												}
											})
										}
									})
								}	
							}
						})
					}
				}
			}
		}
	})
}


exports.filter_voucher = function(from_date, to_date, status, email, callbackSucess, callbackError){
	var selectQuery = "select email, voucherCode, voucherAmount, createdAt, expiryDate, status, availableAmount from voucher_detail where 1 ";
	var status_condition = "";
	var email_condition = "";
	var time_condition = "";
	var vaidate = true;
	if (status == "active" ||  status == "inactive") {
		status_condition = "status = "+status;
	}
	if (email) {
		email_condition  = "email like %"+email+"%"
	}
	if (moment(from_date).isValid() && moment(to_date).isValid()) {
		time_condition = "BETWEEN '"+moment(from_date).format("YYYY-MM-DD")+"' AND '"+moment(to_date).format("YYYY-MM-DD")+" 23:59:59.999'"
	}else{
		vaidate = false;
		console.log("Incorrect Date Format");
		callbackSucess({"response":false,"responseString":"Incorrect Date Format"});	
	}

	query = selectQuery + "and " + status_condition + "and " + email_condition + "and " + time_condition;
	if (vaidate) {
		con.query(selectQuery, function (err,res) {
			if (err) {
				console.log("filter_voucher selectQuery err",err);
				callbackError({"response":false,"responseString":"Something Went Wrong, Please Try Again"});			
			}else{
				if (res.length == 0) {
					callbackSucess({"response":true,"responseString":"No Voucher Available","data":[]})
				}else{
					callbackSucess({"response":true,"responseString":"Voucher Detail Fetched Successfully","data":res})
				}
			}
		})
	}
}