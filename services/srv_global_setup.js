const fs = require('fs');
const path = require('path');

class SrvGlobalSetup {

    token = '';
    arr_symbols = [];
    main_dir = '';
    map_browser_dir = {
        'win32': 'D:/Program Files/chrome-win/chrome.exe',      // -----> Download chromium and extract it to this directory.
        'linux': '/snap/bin/chromium',                          // -----> Download chromium --> sudo apt install chromium -y
    };




    async init_setup() {

        console.log('============================================');
        console.log(`=========== RUNNING INITIAL SETUP ==========`)
        console.log('============================================');

        let dir = path.join(__dirname, '..',);
        this.main_dir = dir;
    }



    async save_token(token) {

        console.log("================================================================");
        console.log("========================== save_token ==========================");
        console.log("================================================================");

        if (!token) {
            console.log("========================== Token invalid");
            return;
        }

        const json_raw = await new Promise(resolve => {
            fs.readFile(path.join(this.main_dir, 'config', 'global.json'), 'utf8', (err, val) => {
                resolve(val);
            });
        });

        let json_parsed = JSON.parse(json_raw);

        console.log(json_parsed);
        console.log(token);



        // ==========================================================================
        // ============================== SAVE TOKEN ================================
        // ==========================================================================

        json_parsed.token = token;
        this.token = token;
        console.log(json_parsed);

        // path.join(this.main_dir, 'config','global_2.json'), json_parsed, { encoding: 'utf8', flag: 'w' }
        fs.writeFile(
            path.join(this.main_dir, 'config', 'global.json'),
            JSON.stringify(json_parsed, null, 2),
            'utf-8',
            (err) => {
                if (err) {
                    console.log(err);
                    return;
                }
                console.log('Saved!');
            }
        );
    }



    getWords() {
        let arrWords = [
            'SALE',
            'HEMAT',
            'PROMO',
            'SPECIAL',
            'SPESIAL',
            'SPECIAL OFFER',
            'REWARD',
            'HARGA KHUSUS',
            'GRATIS',
            'CASHBACK',
            'PROMOTION',
            'BUY 1 GET 1',
        ];
        return arrWords;
    }

}



module.exports = new SrvGlobalSetup()