
const express = require('express');
const puppeteer = require('puppeteer');
require("dotenv").config();
const cors = require("cors");
//const { cacheDirectory } = require('./puppeteer.config');
const app = express();
app.use(cors());
app.use(express.json());

app.get("/",async(req,res)=>{
        let browser;
        let output='';
        const userUrl=req.query.userUrl;
        console.log("user   -" ,userUrl);
        (async () => {
            console.log(userUrl," ");
            const validUrlRegex = /^(ftp|http|https):\/\/[^ "]+$/;
            if (!validUrlRegex.test(userUrl)) {
                console.error('Invalid URL format:', userUrl);
                res.status(400).send({ error: 'Invalid URL format.' }); 
                return;
            }
            res.send("hello1");
            browser = await puppeteer.launch({
                args:[
                    "--disable-setuid-sandbox",
                    "--no-sandbox",
                    "--single-process",
                    "--no-zygote"
                ],
                executablePath:process.env.NODE_ENV === 'production'? process.env.PUPPETEER_EXECUTABLE_PATH : puppeteer.executablePath(),});
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
            console.log("video url present");
            console.log("vid",videoSrc);
            res.json(output);
            }
            await browser.close(); 

        })();
    
    
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