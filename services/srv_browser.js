const puppeteer = require('puppeteer-extra');
const srv_email = require('./srv_email');
const srv_helper = require('./srv_helper');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const srv_global_setup = require('./srv_global_setup');
const { platform } = require('os');

class SrvBrowser {


    async getPosts(arrIgAccts) {

        console.log('========================================')
        console.log('============ STARTING CHROME ===========')
        console.log('========================================')

        puppeteer.use(StealthPlugin());

        const browser = await puppeteer.launch({
            executablePath: this.get_browser(),
            headless: false,
            userDataDir: './file_storage/chromeProfile',
            args: [
                '--disable-notifications',
                '--password-store=basic',
                '--disable-features=PasswordCheck',
                '--no-sandbox',
            ],

            ignoreDefaultArgs: [
                '--enable-automation'
            ]
        });

        let pages = await browser.pages()
        // for(var el of pages){
        //     await el.close();
        // }

        const page = await browser.newPage();

        for (var acct of arrIgAccts) {
            const url = acct.IgLink
            // const url = 'https://www.instagram.com/kopikenangan.id/'

            await page.goto(
                url,
                { waitUntil: 'networkidle0' }
            );

            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });

            await srv_helper.delay(3000);

            const links = await page.$$eval('a', (anchors) => {
                const result = [];

                for (const a of anchors) {
                    console.log(a)
                    if (a.children.length !== 2) continue;
                    if (!a.href.includes('instagram.com')) continue;

                    result.push({
                        postHref: a.href,
                        postType: a.href.includes('reel') ? 'reel' : 'post',
                    });
                }

                console.log(result);
                return result;
            });


            acct.postLinks = links;
        }


        console.log(JSON.stringify(arrIgAccts, null, 2));




    }



    async scrapPost(arr_links, browser) {

        console.log('========================================')
        console.log('============ STARTING CHROME ===========')
        console.log('========================================')

        let t_start = new Date();

        puppeteer.use(StealthPlugin());

        // const browser = await puppeteer.launch({
        //     executablePath: this.get_browser(),
        //     headless: false,
        //     userDataDir: './file_storage/chromeProfile',
        //     args: [
        //         '--disable-notifications',
        //         '--password-store=basic',
        //         '--disable-features=PasswordCheck',
        //         '--no-sandbox',
        //     ],

        //     ignoreDefaultArgs: [
        //         '--enable-automation'
        //     ]
        // });

        console.log(`======== Launched Puppeteer in ${Date.now() - t_start}ms`);

        const page = await browser.newPage();
        // console.log(`======== Launched New Page ${Date.now() - t_start}ms`);


        // ====================================================
        // =================== DISABLE CSS ====================
        // ====================================================

        // page.on('request', (request) => {
        //     const resourceType = request.resourceType();
        //     if (
        //         resourceType === 'stylesheet' ||
        //         resourceType === 'font'
        //     ) {
        //         request.abort();
        //     } else {
        //         request.continue();
        //     }
        // });


        for (var link of arr_links) {

            const url = link

            await page.goto(
                url,
                // { waitUntil: 'networkidle0' }
            );

            const strP = await page.$$eval('span', (span) => {
                const result = [];

                for (const s of span) {
                    if (s.children.length != 1) continue;


                    const isPromo =
                        s.outerHTML.toUpperCase().includes('SALE') ||
                        s.outerHTML.toUpperCase().includes('PROMO') ||
                        s.outerHTML.toUpperCase().includes('SPECIAL') ||
                        s.outerHTML.toUpperCase().includes('SPESIAL') ||
                        s.outerHTML.toUpperCase().includes('SPECIAL OFFER') ||
                        s.outerHTML.toUpperCase().includes('REWARD') ||
                        s.outerHTML.toUpperCase().includes('HARGA KHUSUS') ||
                        s.outerHTML.toUpperCase().includes('CASHBACK');

                    if (!isPromo) continue;

                    result.push({
                        outerHTML: s.outerHTML,
                        childCount: s.children.length,
                        isPromo: isPromo,
                    });
                }

                return result;
            });

            for (var item of strP) {
                item.url = url
            }


            console.log(strP);
        }
    }


    async get_session() {

        console.log('========================================')
        console.log('============ STARTING CHROME ===========')
        console.log('========================================')

        let t_start = new Date();

        const browser = await puppeteer.launch({
            executablePath: this.get_browser(),
            headless: true,
            userDataDir: './fie_storage/my_custom_profile_dir',
            args: [
                '--disable-notifications',
                '--password-store=basic',
                '--disable-features=PasswordCheck',
                '--no-sandbox',
            ],

            ignoreDefaultArgs: [
                '--enable-automation'
            ]
        });
        console.log(`======== Launched Puppeteer in ${Date.now() - t_start}ms`);

        const page = await browser.newPage();
        // console.log(`======== Launched New Page ${Date.now() - t_start}ms`);


        // ====================================================
        // =================== DISABLE CSS ====================
        // ====================================================

        await page.setRequestInterception(true);

        page.on('request', (request) => {
            const resourceType = request.resourceType();
            if (
                resourceType === 'stylesheet' ||
                resourceType === 'font'
            ) {
                request.abort();
            } else {
                request.continue();
            }
        });

        this.listen_request(page);

        const url = 'https://stockbit.com/login'
        // const url = 'https://www.tempo.co/' // ------> DEBUG

        await page.goto(
            url,
            { waitUntil: 'networkidle0' }
        );

        console.log(`======== Page Loaded in ${Date.now() - t_start}ms`);

        const client = await page.target().createCDPSession();

        await client.send('Browser.setPermission', {
            permission: {
                name: 'notifications'
            },
            setting: 'denied'
        });

        // =====================================================
        // =================== BOT SEQUENCE ====================
        // =====================================================


        await page.locator('#username').fill('beaconkiller@zohomail.com');
        await page.locator('#password').fill('_Ajinih12_');
        await page.locator('#email-login-button').click();

        await page.locator(
            '[data-cy="confirm-otp-input-box"]'
        ).wait();

        let otp = await new Promise((resolve) => {
            srv_email.get_emitter().once('otp', (val) => {
                resolve(val);
            });
        });


        const otpInput = page.locator('[data-cy="confirm-otp-input-box"]');

        await otpInput.fill(String(otp));
        await srv_helper.delay(2000);

        // this.screenshot_page(page, "session");

        await page.locator(
            '.ant-btn.ant-btn-primary.ant-btn-block'
        ).click();


        await page.waitForNetworkIdle('networkidle2');

        // this.screenshot_page(page, "home");

        console.log(``);
        console.log(`=============== Getting TOKEN done in ${Date.now() - t_start}ms`);
        console.log(``);

        await browser.close();
    }



    async listen_request(page) {

        let _res = await new Promise((resolve) => {
            let handler = async (response) => {

                // console.log(response);
                // https://exodus.stockbit.com/auth/websocket/key

                const request = response.request();
                const headers = response.headers();
                const type = request.resourceType();

                const to_search = "https://exodus.stockbit.com/auth/websocket/key";
                // const to_search = "https://ut.pubmatic.com/geo?pubid=0"; // ---> debug


                if (type === 'xhr' || type === 'fetch') {
                    try {
                        if (response.url() === to_search) {
                            let result = request.headers()['authorization'];
                            // let result = request.headers()['referer']; // -----> debug

                            page.off('response', handler);
                            resolve(result)
                        }
                    } catch (err) {
                        console.log('Not JSON');
                        console.error(err);
                    };
                };
            };
            page.on('response', handler);
        })
        srv_global_setup.save_token(_res);
        return;
    }



    async set_token(token) {
        srv_global_setup.save_token(token);
    }



    async screenshot_page(page, prefix) {
        await page.screenshot({ path: path.join(srv_global_setup.main_dir, 'file_storage', 'screenshots', `${Date.now()}_${prefix ? prefix : ``}.png`) });
    }



    get_browser() {
        let str_os = process.platform;
        let browser_dir = srv_global_setup.map_browser_dir[str_os]
        return browser_dir;
    }

}


module.exports = new SrvBrowser();