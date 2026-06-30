const ser_web_server = require('./services/ser_web_server');
const srv_browser = require("./services/srv_browser");
const srv_global_setup = require("./services/srv_global_setup");
const srv_helper = require('./services/srv_helper');
const SrvDataPost = require('./services/SrvDataPost');


async function startup() {

    console.log(' ');
    console.log(' ');
    console.log('============================================');
    console.log('================= STARTING =================');
    console.log('============================================');
    console.log(' ');

    // ----------------------------------------
    // ----------- INIT GLOBAL SETUP ----------
    // ----------------------------------------

    console.log('============================================');
    console.log('======== SETTING UP GLOBAL VARIABLE ========');
    console.log('============================================');
    console.log(' ');

    await srv_global_setup.init_setup();
    // await srv_worker_getter.test_token();


    // ----------------------------------------
    // ------------ RUN SCHEDULER -------------
    // ----------------------------------------

    // try {
    //     console.log('============================================');
    //     console.log('=============== RUN SCHEDULER ==============');
    //     console.log('============================================');
    //     console.log(' ');

    //     srv_scheduler.set_scheduler();
    // } catch (err) {
    //     console.error(`${err}`);
    //     process.exit(1); // Non-zero failure code
    // }



    // ----------------------------------------
    // -------------- WEB-SERVER --------------
    // ----------------------------------------

    // try {
    //     console.log('============================================');
    //     console.log('========== INITIALIZING WEB SERVER =========');
    //     console.log('============================================');
    //     console.log(' ');

    //     await ser_web_server.initialize();
    // } catch (err) {
    //     console.error(`${err}`);
    //     process.exit(1); // Non-zero failure code
    // }



    // ----------------------------------------
    // -------------- WEB SOCKET --------------
    // ----------------------------------------

    // try {
    //     console.log('Initializing socket client');
    //     await repo_ws.initialize();
    // } catch (err) {
    //     console.error(err);
    //     process.exit(1);
    // }

    // ============================================
    // =============== MAIN FUNC ==================
    // ============================================

    // await srv_browser.initiateLogin();

    let arrObj = [
        {
            id: 'kopiKenangan',
            IgLink: 'https://www.instagram.com/kopikenangan.id/',
        },
        {
            id: 'burgerKing',
            IgLink: 'https://www.instagram.com/burgerking.id/',
        },
        {
            id: 'indomaret',
            IgLink: 'https://www.instagram.com/indomaret/',
        },
        {
            id: 'mcd',
            IgLink: 'https://www.instagram.com/mcdonaldsid/',
        },
        {
            id: 'alfamidi',
            IgLink: 'https://www.instagram.com/alfamidi_ku/',
        },
        {
            id: 'dCrepes',
            IgLink: 'https://www.instagram.com/d_crepes/',
        },
        {
            id: 'tomSushi',
            IgLink: 'https://www.instagram.com/tomsushiidn/',
        },
        {
            id: 'chatime',
            IgLink: 'https://www.instagram.com/chatimeindo/',
        },
        {
            id: 'haus',
            IgLink: 'https://www.instagram.com/haus.indonesia/',
        },
        {
            id: 'lawson',
            IgLink: 'https://www.instagram.com/lawson_indonesia/',
        },
        {
            id: 'excelso',
            IgLink: 'https://www.instagram.com/excelsocoffee/',
        },
        {
            id: 'wingstop',
            IgLink: 'https://www.instagram.com/wingstopid/',
        },
        {
            id: 'krispykremeid',
            IgLink: 'https://www.instagram.com/krispykremeid/',
        },
        {
            id: 'jcoindonesia',
            IgLink: 'https://www.instagram.com/jcoindonesia/',
        },
        {
            id: 'familymartid',
            IgLink: 'https://www.instagram.com/familymartid/',
        },
    ]

    await srv_browser.scrapByObj(arrObj);

    // let latestData = await SrvDataPost.getLatestScrapData();
    // console.log(latestData);
    // latestData = SrvDataPost.getInterestWords(latestData);
    
}




async function shutdown(e) {
    try {
        console.log('Closing db_e_approve');
        await db_e_approve.close()
        console.log('db_e_approve closed');
    } catch (error) {
        console.error(error);
    }
}



async function setGlobalVariable() {
    global.dir_file_storage = path.join(__dirname);
}





startup();

