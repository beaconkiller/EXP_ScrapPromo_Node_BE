const fs = require('fs');
const path = require('path');
const cron = require('node-cron');
const srv_worker_getter = require('./srv_worker_getter');

class SrvScheduler {



    async run_task() {
        console.log('============================================');
        console.log('============ RUNNING JOB BY CRON ===========');
        console.log('============================================');

        try {
            await srv_worker_getter.run_all();
        } catch (error) {
            console.error('============================================');
            console.error('========== FUNCTION ERROR FROM CRON ========');
            console.error('============================================');
            console.error(error);
        }
    }



    set_scheduler() {
        // 12:42
        cron.schedule('42 12 * * *', async () => {
            await this.run_task();
        }, {
            timezone: 'Asia/Jakarta'
        });

        // // 21:00
        // cron.schedule('0 21 * * *', async () => {
        //     await this.run_task();
        // }, {
        //     timezone: 'Asia/Jakarta'
        // });

        // every 1 hour
        cron.schedule('0 * * * *', async () => {
            await this.run_task();
        }, {
            timezone: 'Asia/Jakarta'
        });

    }

}



module.exports = new SrvScheduler()