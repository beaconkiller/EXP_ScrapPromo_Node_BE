const path = require("path");
const fs = require('fs');
// const path = required('path')



exports.get_data = async (req, res) => {
    console.log("\n ================= get_data =============== \n")
    let data = req.query;
    console.log(data);


    try {

        return res.status(200).json({
            isSuccess: true,
            message: "Test",
            data: "Data test"
        })

        let q = `
            select * from tf_eappr.AP_TRN_OFFICE_BALANCE_HDR t_saldo
            where 
                t_saldo.office_code = :office_code
            ;
        `

        let binds = {
            office_code: data['office_code']
        };


        // console.log(binds);

        let _res = await simpleExecute(q, binds);

        // console.log(' -------------- _res -------------- ');
        // console.log(data['office_code']);
        // console.log(_res);
        // console.log(' -------------- _res -------------- ');


        return res.json({
            status: 200,
            isSuccess: true,
            data: _res,
        })
    }
    catch (e) {
        console.error(e.message)
        res.status(500).json({
            status: 500,
            isSuccess: false,
            message: e.toString(),
            data: null
        })
    }

}





// --------- reset invoice ---------
//
// UPDATE AP_TRN_PROSES_FINANCE SET STATUS = NULL, STATUS_DATE = NULL, REASON = NULL, STATUS_BY = NULL
// WHERE REFF_NO = '202601I000010';

