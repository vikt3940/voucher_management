# voucher_management

Generate Voucher : 

URL - http://localhost:3000/api/generatevoucher

param :

email:vikt3904@gmail.com
pin:sff54
amount:1000

response :- 

{
    "response": true,
    "responseString": "Voucher Generated Successfully",
    "data": {
        "email": "vikt3904@gmail.com",
        "voucherCode": "VCD34A4E5C8CD"
    }
}

redeem Voucher


url : - http://localhost:3000/api/redeemvoucher

param:

email:vikt3904@gmail.com
pin:sff54
voucherCode:VCD34A4E5C8CD
redeemAmount:100


response
{
    "response": true,
    "responseString": "Voucher Code Redeem Successfully",
    "data": {
        "email": "vikt3904@gmail.com",
        "voucherCode": "VCD34A4E5C8CD",
        "redeemAmount": "100",
        "availableAmount": 900
    }
}

filter_voucher

http://localhost:3000/api/filter_voucher

param

from_date : 2019-09-22
to_date : 2019-09-23

reponse:

{
    "response": true,
    "responseString": "Voucher Detail Fetched Successfully",
    "data": [
        {
            "email": "vikt3904@gmail.com",
            "voucherCode": "VCD34A4E5C8CD",
            "voucherAmount": 1000,
            "createdAt": "2019-09-22 16:16:07",
            "expiryDate": "2019-09-23 16:16:07",
            "status": "active",
            "availableAmount": 900
        }
    ]
}
