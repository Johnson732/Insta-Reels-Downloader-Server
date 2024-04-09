
const express = require('express');
const puppeteer = require('puppeteer');
const cors = require("cors");
const { cacheDirectory } = require('./puppeteer.config');
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",async(req,res)=>{
    try{
        let output='';
        const userUrl=req.query.userUrl;
        console.log("user   -" ,userUrl);
        (async () => {
            console.log(userUrl," ");
            const validUrlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
            if (!validUrlRegex.test(userUrl)) {
                console.error('Invalid URL format:', userUrl);
                return res.status(400).send({ error: 'Invalid URL format.' }); 
            }
            const browser = await puppeteer.launch({ headless: true,cacheDirectory });
            const page = await browser.newPage();
            await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
            await page.setViewport({ width: 1920, height: 1080 });
            await page.goto(userUrl);
            await page.waitForSelector('video');
        
            const videoSrc = await page.evaluate(() => {
            const video = document.querySelector('video');
            return video ? video.src : null;
            });
            output=videoSrc;
            if (videoSrc) {
            //console.log("video url present");
            res.json(output);
            }else {
                console.log('Video element not found on the original page.');
                res.status(404).send({ error: 'Video element not found on the original page.' });
            }
            await browser.close(); 
        })();
    }catch(error){
        console.log(error);
    }  
    
})

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Hey Express Server running on port ${PORT}`);
});
module.exports = app;





/*
for post download only fetching completed---

app.get("/post",async(req,res)=>{
    console.log("------------");
    let output='';
    const userUrl=req.query.userUrl;
    
(async () => {
    const browser = await puppeteer.launch({ headless: true });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1920, height: 1080 });
    await page.goto(userUrl);
    await page.waitForSelector('div._aao_');

    let arr = [];
    let postSrc='';
    const clickNextButton = async () => {
        const nextButton = await page.$('button[aria-label="Next"]');
        if (nextButton) {
            await nextButton.click();
            postSrc = await page.evaluate(() => {
            const img = document.querySelector('div._aagv img');
            console.log("img",img.src);
            return img ? img.src : null;    
            });
            if (postSrc) {
                console.log("psrc",postSrc);
                arr.push(postSrc);
            }
            await delay(1000);
            return true;
        }
        return false;
    };
    function delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    while (await clickNextButton()) {
        console.log("==========");
    }
    //console.log(arr);
    console.log("====completed fetching======");
    res.json(arr);
    // await browser.close();
})(); 
})
*/