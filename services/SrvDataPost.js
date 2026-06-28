const srv_helper = require("./srv_helper");

class SrvDataPost {

    async exportScrapData(arrObj) {
        let arrPostData = [];
        for (let obj of arrObj) {
            arrPostData = [...arrPostData, ...obj.postLinks]
        }

        console.log(arrPostData);

        await srv_helper.export_csv(arrPostData, srv_helper.get_date_iso_string());
    }



    async getInterestWords(arrObj){
        for(let acct of arrObj){
            for(var post of acct.postLinks){
                console.log('---------------');
                console.log('---------------');
                console.log('---------------');

                console.log(post);
            }
        }
    }

}

module.exports = new SrvDataPost()