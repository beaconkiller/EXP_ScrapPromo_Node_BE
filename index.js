const ser_web_server = require('./services/ser_web_server');
const srv_browser = require("./services/srv_browser");
const srv_global_setup = require("./services/srv_global_setup");


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

    try {
        console.log('============================================');
        console.log('========== INITIALIZING WEB SERVER =========');
        console.log('============================================');
        console.log(' ');

        await ser_web_server.initialize();
    } catch (err) {
        console.error(`${err}`);
        process.exit(1); // Non-zero failure code
    }



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

    // ===========================================
    // ================= DEBUG ===================
    // ===========================================

    srv_browser.getPosts([
        {
            id: 'KopiKenangan',
            IgLink: 'https://www.instagram.com/kopikenangan.id/',
        },
        {
            id: 'StarBucks',
            IgLink: 'https://www.instagram.com/starbucksindonesia/',
        },
    ]);

    // srv_browser.scrapPost([
    //     'https://www.instagram.com/p/DZ6lay5OxjW/',
    // ]);

    // srv_worker_getter_micro.start_loop_broker_sum();

    // srv_worker_getter_running_trade.start_loop_get_running_trade();

    // await srv_worker_getter.get_bearer_token();

    // await srv_worker_getter.run_all();
    // await srv_worker_getter.get_all_historical_data();
    // await srv_worker_getter.get_all_broker_summary_data();

    // srv_helper.get_date_iso_string();
    // srv_browser.get_browser();

    // srv_worker_getter.get_all_historical_data();
    // await srv_email.init();
    // await srv_browser.get_session();
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

