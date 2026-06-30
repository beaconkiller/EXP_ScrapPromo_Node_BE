const puppeteer = require('puppeteer-extra');
const srv_helper = require('./srv_helper');
const path = require('path');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const srv_global_setup = require('./srv_global_setup');
const { platform } = require('os');
const SrvDataPost = require('./SrvDataPost');

class SrvBrowser {



    async scrapByObj(arrObj) {
        await this.getPostsAll(arrObj);

        let arrPosts = SrvDataPost.mergeAllPosts(arrObj);
        // arrPosts = SrvDataPost.removeFetchedPosts(arrPosts); // <---- Eliminate already fetched posts

        let arrPostsResult = await this.scrapPostDetailBatchAll(arrPosts);
        arrPostsResult = await SrvDataPost.getInterestWords(arrPostsResult);
        srv_helper.export_csv(arrPostsResult, 'scrap');



        // await SrvDataPost.exportScrapData(arrObj);
        // console.log(JSON.stringify(arrObj, null, 2));
    }



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
        } catch (error) {
            console.log('err')
        }
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


            // ------------------------------------------------------------------
            // ---------- THIS WOULD ONLY WORK IF WE'RE LOGGED IN TO IG ---------
            // ------------------------------------------------------------------

            // const responsePromise = this.listen_request(page);

            // await page.evaluate(() => {
            //     window.scrollTo(0, document.body.scrollHeight);
            // });

            // let response = await responsePromise

            // ------------------------------------------------------------------

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
        };
    };



    async scrapPostDetailBatchAll(arrPosts) {

        console.log('========================================')
        console.log('======== scrapPostDetailBatchAll =======')
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


        let pageMain = await browser.newPage();
        await this.letOneLiveEnd(browser);

        let tmpArrPosts = arrPosts;
        console.log('tmpArrPosts');
        console.log(tmpArrPosts);
        console.log('tmpArrPosts');

        // ---------------------------------------------------------------
        // ----------------------- SUPER IMPORTANT -----------------------
        // ---------------------------------------------------------------
        // -- The batch size is directly involved with our CPU and RAM, --
        // -- and network bandwith. Simultaneously opening a lot of     --
        // -- tabs would spike our resource usage. Best just to limit   --
        // -- this to minimum.                                          --
        // ---------------------------------------------------------------

        let batchSize = 4;

        // ---------------------------------------------------------------

        for (let i = 0; i < tmpArrPosts.length;) {
            let arrFuncs = [];
            for (let b = 0; b < batchSize; b++) {
                if (!tmpArrPosts[i]) continue;
                arrFuncs.push((async () => {
                    let post = tmpArrPosts[i];

                    const page = await browser.newPage();
                    await page.setRequestInterception(true);



                    // ====================================================
                    // =================== DISABLE CSS ====================
                    // ====================================================

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

                    const url = post.postHref

                    await page.goto(
                        url,
                        // { waitUntil: 'networkidle0' },
                        // { waitUntil: 'domcontentloaded' }, // <---- this sucks, sometimes captions turned to >messages<, undetectable.
                        { waitUntil: 'networkidle2' },
                    );



                    // ----------------------------------------------------
                    // -------------- SEARCH FOR PROMO WORDS --------------
                    // ----------------------------------------------------

                    const arrWords = srv_global_setup.getWords();
                    const searchPromoWords = await page.$$eval(
                        'div',
                        (divs, arrWords) => {
                            const arr = [];
                            for (const d of divs) {
                                if (d.children.length !== 2) continue;

                                if (
                                    d.children[0].tagName !== 'DIV' ||
                                    d.children[1].tagName !== 'SPAN'
                                ) {
                                    continue;
                                }

                                const span = d.children[1];
                                const text = span.textContent.toUpperCase();
                                const isPromo = arrWords.some(word => text.includes(word));

                                arr.push({
                                    outerHtml: d.outerHTML,
                                    spanOuterHtml: span.outerHTML,
                                    isPromo,
                                });
                            };
                            return arr;
                        },
                        arrWords);



                    // ----------------------------------------------------
                    // ----------------- SEARCH FOR DATES -----------------
                    // ----------------------------------------------------

                    const searchPostDate = await page.$$eval('time', (times) => {
                        let obj = {
                            postDate: null
                        }
                        if (times.length == 0) return obj;
                        obj.postDate = times[0].dateTime
                        return obj;
                    });

                    post.postDate = searchPostDate.postDate ?? null;
                    post.isInterest = searchPromoWords.length > 0 ? searchPromoWords[0].isPromo : false
                    post.spanOuterHtml = searchPromoWords.length > 0 ? searchPromoWords[0].spanOuterHtml : false
                    post.postAcct = post.postHref.split('/')[3]
                    await page.close();
                })())
                i++
            }
            await Promise.all(arrFuncs);
        };
        await browser.close();
        return tmpArrPosts
    };



    async scrapPostDetail(browser, arrPosts) {

        console.log('========================================')
        console.log('============ scrapPostDetail ===========')
        console.log('========================================')

        let t_start = new Date();

        puppeteer.use(StealthPlugin());

        let tmpArrPosts = JSON.parse(JSON.stringify(arrPosts));

        // ---------------------------------------------------------------
        // ----------------------- SUPER IMPORTANT -----------------------
        // ---------------------------------------------------------------
        // -- The batch size is directly involved with our CPU and RAM, --
        // -- and network bandwith. Simultaneously opening a lot of     --
        // -- tabs would spike our resource usage. Best just to limit   --
        // -- this to minimum.                                          --
        // ---------------------------------------------------------------

        let batchSize = 4;

        // ---------------------------------------------------------------

        for (let i = 0; i < tmpArrPosts.length;) {
            let arrFuncs = [];
            for (let b = 0; b < batchSize; b++) {
                if (!tmpArrPosts[i]) continue;
                arrFuncs.push((async () => {
                    let post = tmpArrPosts[i];

                    const page = await browser.newPage();
                    await page.setRequestInterception(true);



                    // ====================================================
                    // =================== DISABLE CSS ====================
                    // ====================================================

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


                    // console.log(post);
                    // console.log('-------- post --------');
                    const url = post.postHref

                    await page.goto(
                        url,
                        // { waitUntil: 'networkidle0' },
                        // { waitUntil: 'domcontentloaded' }, // <---- this sucks, sometimes captions turned to >messages<, undetectable.
                        { waitUntil: 'networkidle2' },
                    );

                    // ----------------------------------------------------
                    // -------------- SEARCH FOR PROMO WORDS --------------
                    // ----------------------------------------------------

                    const searchPromoWords = await page.$$eval('div', (divs) => {
                        const arr = [];

                        for (const d of divs) {
                            if (d.children.length !== 2) continue;

                            if (
                                d.children[0].tagName !== 'DIV' ||
                                d.children[1].tagName !== 'SPAN'
                            ) {
                                continue;
                            }

                            const span = d.children[1];
                            const text = span.textContent.toUpperCase();

                            const isPromo =
                                text.includes('SALE') ||
                                text.includes('HEMAT') ||
                                text.includes('PROMO') ||
                                text.includes('SPECIAL') ||
                                text.includes('SPESIAL') ||
                                text.includes('SPECIAL OFFER') ||
                                text.includes('REWARD') ||
                                text.includes('HARGA KHUSUS') ||
                                text.includes('GRATIS') ||
                                text.includes('CASHBACK') ||
                                text.includes('BUY 1 GET 1');

                            arr.push({
                                outerHtml: d.outerHTML,
                                spanOuterHtml: span.outerHTML,
                                isPromo,
                            });
                        }

                        return arr;
                    });

                    // ----------------------------------------------------
                    // ----------------- SEARCH FOR DATES -----------------
                    // ----------------------------------------------------

                    const searchPostDate = await page.$$eval('time', (times) => {
                        let obj = {
                            postDate: null
                        }
                        if (times.length == 0) return obj;


                        obj.postDate = times[0].dateTime

                        return obj;
                    });


                    post.postDate = searchPostDate.postDate ?? null;
                    post.isInterest = searchPromoWords.length > 0 ? searchPromoWords[0].isPromo : false
                    post.spanOuterHtml = searchPromoWords.length > 0 ? searchPromoWords[0].spanOuterHtml : false
                    post.postAcct = post.postHref.split('/')[3]
                    await page.close();
                })())
                i++
            }
            await Promise.all(arrFuncs);
        };
        return tmpArrPosts
    };



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
            // arrFunc.push((async () => {
            //     acct.postLinks = await this.scrapPostDetail(browser, acct.postLinks);
            // })())
            acct.postLinks = await this.scrapPostDetail(browser, acct.postLinks);
        };

        // console.log('---------- PROMSIE ALL ----------')

        // await Promise.all(arrFunc);

        await this.letOneLiveEnd();

        browser.close();
    }



    async scrapPostDetailAllV2(arrObj) {
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
            // arrFunc.push((async () => {
            //     acct.postLinks = await this.scrapPostDetail(browser, acct.postLinks);
            // })())
            acct.postLinks = await this.scrapPostDetail(browser, acct.postLinks);
        };

        // console.log('---------- PROMSIE ALL ----------')

        // await Promise.all(arrFunc);

        await this.letOneLiveEnd();

        browser.close();
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
    };



    async initiateLogin() {

        try {
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


            let pageMain = await browser.newPage();
            await this.letOneLiveEnd(browser);


            await pageMain.goto(
                'https://www.instagram.com/',
                { waitUntil: 'networkidle0' }
            );

            // await Promise.all(arrFuncs);
            // console.log(JSON.stringify(arrIgAccts, null, 2));
            // await browser.close();
        } catch (error) {
            console.log('err')
        }
    }


}


module.exports = new SrvBrowser();