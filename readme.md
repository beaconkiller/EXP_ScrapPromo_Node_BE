# Promo Scrapper
## Intro
Made this to scrap whatever promo those guys had through their instagram (in the hope that their marking team is posting the promo). Mainly just for experimenting with Node's puppeteer. It would work once you did a successful login and saved into the profile directory. Any messy functions are probably there for the future (or idk.).

Would get back to this soon cus i realize it probably would help me or some people if they're going out and planning to dine-in. 

## Quickstart

Make sure you have these before proceeding :
1. Chromium.
2. Windows (for now).

We need windows because logging in needs a gui (hopefully i could solve this in the future).

for starter, make sure to fill the array object like this :

```js
    let arrObj = [
        {
            id: 'KopiKenangan',
            IgLink: 'https://www.instagram.com/kopikenangan.id/',
        },
        {
            id: 'StarBucks',
            IgLink: 'https://www.instagram.com/starbucksindonesia/',
        },
        {
            id: 'BurgerKing',
            IgLink: 'https://www.instagram.com/burgerking.id/',
        },
    ]
```

and put into our srv_browser.getPostsAll() to get the initial posts of those accounts. Then proceed to reuse the same variable that has been processed, with this :

```js
    await srv_browser.scrapPostDetailAll(arrObj);
```


<em>**Hungry man eat a spaghetti. But a wise man write one.**</em> 