# Promo Scrapper
## Intro
Made this to scrap whatever promo those guys had through their instagram (in the hope that their marking team is posting the promo). Mainly just for experimenting with Node's puppeteer. It would work once you did a successful login and saved into the profile directory. Any messy functions are probably there for the future (or idk.).Would get back to this soon cus i realize it probably would help me or some people if they're going out and planning to dine-in. 

It's currently fully operational on Windows because we need to log in to ig first using the real ig UI. But turns out the pages are still accessible even if we're not logged in. The limitation is the number of posts we could scrap. Havent tried on Ubuntu though, that would be the next step.

## Squence
The sequence of this script, respectively :
- Run a post scrap for each account in the object.
- Run a more detailed post scrap for each post from earlier scrap.
- Mark posts that have interesting words.
- Export to a csv.


## Quickstart

Make sure you have these before proceeding :
1. Chromium.
2. Windows (for now).

We need windows because logging in needs a gui (hopefully i could solve this in the future). This was ran mainly with PM2, but could be run with plain node like this code below 

```terminal
node index.js
```


for starter, make sure to fill the array object like this :

```js
    let arrObj = [
        {
            id: 'BurgerKing',
            IgLink: 'https://www.instagram.com/burgerking.id/',
        },
    ]
```

and put into our srv_browser.scrapByObj(arrObj); to get the initial posts of those accounts. 

```js
await srv_browser.scrapByObj(arrObj);
```

This is a shortcut function to scrap, and export all of the data into a .csv file.

# Known issues
- Sometimes it's stuck on a page when fetching detailed post and it made the whole script stuck.
- There would be an error from puppeteer-stealth that gave us Target Protocol Error when we're done fetching detailed post and closing the page, but its not affecting anything other than our log (which should be handled in the future if we're saving the logs.).
- Pages are sometimes not opened because of bot detection on browsers (which could be solved by injecting a proper cookies from an actual login process.).



# Coming soon
This is just a side project but i have some things in mind for future updates.
- ~~Auto ignored fetched post (probably going to save it to a .csv or just a plain .json.).~~
- ~~Map what "interesting" words thats contained in fetched post (probably in an array).~~
- ~~Rework the concurrent page fetch for better resource efficiency.~~
- Probably save the post image with compressing and ignoring the same image as postLink as it's fileName.
- Adding fetchDate in final array.
- Probably cleaning the caption for easier read.


 
<em>**Hungry man eats a spaghetti. But a wise man writes one. I'm a wise man.**</em> 