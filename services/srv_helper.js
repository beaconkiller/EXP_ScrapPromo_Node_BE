const { json2csv } = require("json-2-csv");
const fs = require('fs');

class SrvHelper {
    async delay(time) {
        if (!time) time = 2000;
        await new Promise((resolve) => {
            setTimeout(() => {
                resolve();
            }, time);
        })
    }


    async export_csv(data, prefix) {
        try {
            const csv = json2csv(data);
            fs.writeFileSync(
                `./file_storage/file_export/${prefix ? prefix : ''}_${Date.now()}.csv`,
                csv
            )
        } catch (error) {
            console.error(error);
        }
    }



    get_date_iso_string() {
        let curr_date = new Date();
        let int_days_decrement = 0;

        curr_date.setDate(curr_date.getDate() - int_days_decrement);
        const str_date = new Date(curr_date).toISOString().split('T')[0]; // "2026-05-26"

        return str_date;
    }
}


module.exports = new SrvHelper();