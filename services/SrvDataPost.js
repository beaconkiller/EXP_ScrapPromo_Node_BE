const srv_global_setup = require("./srv_global_setup");
const srv_helper = require("./srv_helper");
const path = require('path');

class SrvDataPost {

    async exportScrapData(arrObj) {
        let arrPostData = [];
        for (let obj of arrObj) {
            arrPostData = [...arrPostData, ...obj.postLinks]
        };
        await srv_helper.export_csv(arrPostData, srv_helper.get_date_iso_string());
    }



    async getInterestWords(arrData) {

        console.log('--------------------------------');
        console.log('------ getInterestWords() ------');
        console.log('--------------------------------');

        let tmpArrData = JSON.parse(JSON.stringify(arrData));

        let arrWords = srv_global_setup.getWords();
        for (let obj of tmpArrData) {
            if (!obj.isInterest) continue;
            let arrInterestWords = [];
            let caption = obj.spanOuterHtml.toUpperCase();

            console.log(obj.postHref);
            // console.log(caption);
            for (let word of arrWords) {
                if (caption.includes(word)) {
                    arrInterestWords.push(word);
                    console.log(' =========== ');
                };
            }
            obj.interestWords = arrInterestWords;
        }
        return tmpArrData;
    }



    mergeAllPosts(arrObj) {
        let TmpArrObj = JSON.parse(JSON.stringify(arrObj));
        let arr = []
        for (let obj of TmpArrObj) {
            for (let post of obj.postLinks) {
                post.accountName = obj.id;
                arr.push(post);
            }
        };
        return arr;
    };



    async removeFetchedPosts(arrData) {

        console.log('---------------------------------');
        console.log('-- removeFetchedPosts(arrData) --');
        console.log('---------------------------------');

        let csvLatestScrap = await this.findLatestCsv();
        let dataLatestScrap = await srv_helper.readCsv(csvLatestScrap);
        let arrNew = [];
        for (let objNew of arrData) {
            let found = 0;
            for (let objOld of dataLatestScrap) {
                // console.log(`new ${objNew.postHref}`)
                // console.log(`old ${objOld.postHref}`)
                if (objOld.postHref == objNew.postHref) {
                    found++;
                    break;
                }
            }
            if (found == 0) {
                arrNew.push(objNew);
            }
        }
        return arrNew;
    }



    async getLatestScrapData() {
        let filePath = await this.findLatestCsv()
        return await srv_helper.readCsv(filePath);
    }



    async findLatestCsv() {
        console.log('--------------------------------');
        console.log('------- findLatestCsv() --------');
        console.log('--------------------------------');

        let dirPath = `./file_storage/file_export/`;
        let files = await srv_helper.readDirAsync(dirPath);

        return path.join(dirPath, files[files.length - 1]);
    };

}

module.exports = new SrvDataPost()