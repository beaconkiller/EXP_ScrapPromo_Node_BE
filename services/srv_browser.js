const puppeteer = require('puppeteer-extra');
const srv_helper = require('./srv_helper');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const srv_global_setup = require('./srv_global_setup');
const { platform } = require('os');

class SrvBrowser {


    async getPostsAll(arrIgAccts) {

        try {
            console.log('========================================')
            console.log('============ STARTING CHROME ===========')
            console.log('========================================')

            puppeteer.use(StealthPlugin());

            const browser = await puppeteer.launch({
                executablePath: this.get_browser(),
                // headless: false,
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


            let pageMain = await browser.newPage();
            await this.letOneLiveEnd(browser);

            let arrFuncs = [];

            for (let i = 0; i < arrIgAccts.length; i++) {
                let acct = arrIgAccts[i]
                arrFuncs.push((async () => {
                    console.log(acct);
                    console.log(acct.IgLink);

                    // let pageAccount = await browser.newPage();
                    let result = await this.scrapAccountPosts(browser, acct.IgLink)
                    acct.postLinks = result;
                })())

            }

            await Promise.all(arrFuncs);
            // console.log(JSON.stringify(arrIgAccts, null, 2));
            await browser.close();
            return arrIgAccts;
        } catch (error) {
            console.log('err')
        }
    }



    async scrapPostDetailAll(arrObj) {
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

        let arrFunc = [];
        for (let acct of arrObj) {
            console.log(acct);
            acct.postLinks = await this.scrapPostDetail(browser, acct.postLinks);
        };
    }



    async scrapAccountPosts(browser, igLink) {
        // https://www.instagram.com/graphql/query

        try {
            console.log('=========================================')
            console.log('============ scrapAccountPost ===========')
            console.log('=========================================')
            console.log(igLink)
            console.log('=========================================')

            const url = igLink
            // const url = 'https://www.instagram.com/kopikenangan.id/'

            const page = await browser.newPage();

            // ====================================================
            // =================== DISABLE CSS ====================
            // ====================================================

            await page.setRequestInterception(true);
            page.on('request', (req) => {
                const resourceType = req.resourceType();
                if (
                    resourceType === 'stylesheet' ||
                    resourceType === 'image' ||
                    resourceType === 'font'
                ) {
                    req.abort();
                } else {
                    req.continue();
                }
            });


            await page.goto(
                url,
                { waitUntil: 'networkidle0' }
            );



            const responsePromise = this.listen_request(page);

            await page.evaluate(() => {
                window.scrollTo(0, document.body.scrollHeight);
            });


            let response = await responsePromise

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
                return result;
            });

            await new Promise(r => setTimeout(r, 2000));
            await page.close()

            return links
        } catch (error) {
            console.warn(error.message)
        }

    }



    async scrapPostDetail(browser, arrPosts) {

        console.log('========================================')
        console.log('============ scrapPostDetail ===========')
        console.log('========================================')

        let t_start = new Date();

        puppeteer.use(StealthPlugin());

        const page = await browser.newPage();
        await page.setRequestInterception(true);




        // ====================================================
        // =================== DISABLE CSS ====================
        // ====================================================

        page.on('request', (req) => {
            const resourceType = req.resourceType();
            if (
                resourceType === 'stylesheet' ||
                resourceType === 'image'
                // resourceType === 'font'
            ) {
                req.abort();
            } else {
                req.continue();
            }
        });


        for (var post of arrPosts) {
            console.log(post);
            console.log('-------- post --------');
            const url = post.postHref

            await page.goto(
                url,
                { waitUntil: 'networkidle0' }
            );

            const strP = await page.$$eval('span', (span) => {
                const result = [];
                for (const s of span) {
                    if (s.children.length != 1) continue;

                    const isPromo =
                        s.outerHTML.toUpperCase().includes('SALE') ||
                        s.outerHTML.toUpperCase().includes('HEMAT') ||
                        s.outerHTML.toUpperCase().includes('PROMO') ||
                        s.outerHTML.toUpperCase().includes('SPECIAL') ||
                        s.outerHTML.toUpperCase().includes('SPESIAL') ||
                        s.outerHTML.toUpperCase().includes('SPECIAL OFFER') ||
                        s.outerHTML.toUpperCase().includes('REWARD') ||
                        s.outerHTML.toUpperCase().includes('HARGA KHUSUS') ||
                        s.outerHTML.toUpperCase().includes('GRATIS') ||
                        s.outerHTML.toUpperCase().includes('CASHBACK') ||
                        s.outerHTML.toUpperCase().includes('BUY 1 GET 1');

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
            post.postDetail = strP.length > 0 ? strP[0].isPromo : false
        }

        console.log(arrPosts);
    }



    async letOneLiveEnd(browser) {
        let pages = await browser.pages();
        if (pages.length > 1) pages = pages.splice(0, pages.length - 1);
        for (var el of pages) {
            await el.close();
        }
        return;
    }



    async listen_request(page) {
        let _res = await new Promise((resolve) => {
            let handler = async (response) => {
                const request = response.request();
                const type = request.resourceType();

                const to_search = "https://www.instagram.com/graphql/query";

                if (type === 'xhr' || type === 'fetch') {
                    try {
                        if (response.url() === to_search) {
                            const data = await response.json();
                            page.off('response', handler);
                            resolve(data);
                        }
                    } catch (err) {
                        console.log('Not JSON');
                        console.error(err);
                    }
                }
            };
            page.on('response', handler);
        });
        return _res;
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