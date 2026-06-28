# Promo Scrapper
## Intro
Made this to scrap whatever promo those guys had through their instagram (in the hope that their marking team is posting the promo). Mainly just for experimenting with Node's puppeteer. It would work once you did a successful login and saved into the profile directory. Any messy functions are probably there for the future (or idk.).Would get back to this soon cus i realize it probably would help me or some people if they're going out and planning to dine-in. 

It's currently fully operational on Windows because we need to log in to ig first using the real ig UI. But turns out the pages are still accessible even if we're not logged in. The limitation is the number of posts we could scrap. Havent tried on Ubuntu though, that would be the next step.

## Squence
The sequence of this script :
1. Run a post scrap for each account in the object.
2. Run a more detailed post scrap for each post from earlier scrap.
3. Export to a csv.


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

# Known issues
1. Sometimes it's stuck on a page when fetching detailed post and it made the whole script stuck.


# Coming soon
This is just a side project but i have some things in mind for future updates.
1. Auto ignored fetched post (probably going to save it to a .csv or just a plain .json.)
2. Map what "interesting" words thats contained in fetched post.



 
<em>**Hungry man eat a spaghetti. But a wise man write one.**</em> 