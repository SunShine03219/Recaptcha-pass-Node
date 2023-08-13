const { fork } = require('child_process')

const fs = require('fs')
const path = require('path')
const puppeteer = require('puppeteer-extra')
// const StealthPlugin = require('puppeteer-extra-plugin-stealth')
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha')
// const $ = require('cheerio');

const express = require('express');
const app = express();
// const db = require('./database')


puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: 'ce8d21fc56c819aa5d929407a0d9ec07' // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY ⚡
        },
        visualFeedback: true // colorize reCAPTCHAs (violet = detected, green = solved)
    })
)

app.get('/', function (req, res) {
    res.send('Hello');
});

// app.post('/webhook', function (req, res) {
//     console.log(req.query.To);
//     db.query(`INSERT INTO messages (sender, recipient, content, unread) VALUES ("${req.query.From.slice(1)}", "${req.query.To.slice(1)}", "${req.query.Body}", 1)`, (error, item) => {
//         console.log(item.insertId);
//         res.send('Hi');
//     });
// });

let server = app.listen(8080, function () {
    var host = server.address().address;
    var port = server.address().port
    console.log("Example app listening at http://%s:%s", host, port);
});


(async () => {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            devtools: true,
            args: [
                '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--ignore-certificate-errors',
                '--ignore-certificate-errors-spki-list'
            ]
        });
        // const browser = await puppeteer.launch();
        const page = await browser.newPage()

        // await page.setViewport({ width: 1600, height: 900 })

        const response = await page.goto('https://www.corrlinks.com/Login.aspx', { waitUntil: 'load', timeout: 0 });
        // console.log(response)
        await page.screenshot({ path: 'login.png' });
        // page.on('response', async response => {
        // await page.waitForNavigation({ waitUntil: 'domcontentloaded', timeout: 0 });
        try {
            const inputEmail = await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginUserNameTextBox')
            await inputEmail.type('trepordie.com@gmail.com')
            const inputPassword = await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginPasswordTextBox')
            await inputPassword.type('Aa187187')
            const ele = await page.$x('//span[contains(text(), "Block Inmate")]');
            const prop = await ele[0].getProperty('innerText');
            const text = await prop.jsonValue();
            console.log(text);

            // const submitBtn = await page.waitForSelector('#ctl00_mainContentPlaceHolder_loginButton')
            // await submitBtn.click()

            // await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 0 });
            let cookies = await page.cookies();

            const replySMS = fork(path.join(__dirname, 'replySMS'))
            replySMS.send(
                {
                    start: true,
                    cookies: cookies,
                }
            );



        } catch (error) {
            // console.log(error);
        }
        // });
    } catch (error) {
        try { await browser.close() } catch (error) { }
        console.log(error)
    }

})()

async function timeout(ms, logTimer) {
    if (logTimer) console.log(`Tempo: ${ms / 1000}`)
    async function timer(time, logTimer) {
        if (time >= 0) {
            if (logTimer) console.log(`Aguardando: ${time}`)
            await new Promise(resolve => setTimeout(resolve, 1000))
            return await timer(--time, logTimer)
        }
    }
    await timer(ms / 1000, logTimer)
}


