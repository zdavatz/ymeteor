/*
    Scrapping Drug Details from: https://www.pharmnet-bund.de
*/
import './collections.js'
import './db.js'
import './app.js'
import './util.js'
import FlowPup from './flowPub.js'
import Log from './log.js'
const fs = require("fs");
const _ = require('lodash')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const Papa = require('papaparse');
cheerioTableparser = require('cheerio-tableparser')
//
log = console.log;
//
var path = process.env['METEOR_SHELL_DIR'] + '/../../../exp/';
let file = 'atc_ddd_2019.csv'
let filePath = '/private/' + file;
/*
    Testing Mode
*/
let isTest = true;
let isClean = false;
let codeSample = ['A01AA01', 'A01AA03', 'A01AB09', 'A02AC02', 'A02AD04']
/*
 */
pharma = {}
pharma.root = 'https://portal.dimdi.de';
pharma.entry = 'https://www.pharmnet-bund.de/dynamic/de/arzneimittel-informationssystem/index.html'
/*
 */
if (Util.isFileExists(filePath)) {
    var AccCode = Assets.getText(file)
    var AccCode = Papa.parse(AccCode, {
        header: true
    })
    log(AccCode.data.length411, AccCode.data[2])
}

/*

*/

let isCode = Meteor.settings.isCode
if (isCode) {
    log('start', 'Pharma Scrapping init')
    if (isTest) {
        Log('start', chalk.yellow('......TESTING MODE.......'))
    } else {
        Log('start', '......RUN MODE.......')
    }
    scrapPharma(pharma.entry)
}
/*
 */
/*
*/
/*
  Extracting Item from a Page
 */
pharma.extractItem = async (page, keyword) => {
    Log('progress','ACC-Code ExtractItem')
    var [button] = await page.$x("//a[contains(., '+ Fach-/Gebrauchsinformationen')]");
    if (button) {
        await button.click();
    }
    //
    let content = await page.content();
    var $ = cheerio.load(content);
    cheerioTableparser($)
    var item = {}
    item.keyword = keyword;
    item.title = $('#contentFrame > table:nth-child(4) > tbody > tr:nth-child(2) > td').text()
    var general = {
        number: $('#rechts > div:nth-child(2) > div:nth-child(3) > span:nth-child(2)').text(),
        name: $('#rechts > div:nth-child(2) > div:nth-child(5) > span:nth-child(2)').text(),
        dosageForm: $('#rechts > div:nth-child(2) > div:nth-child(7) > span:nth-child(2)').text(),
        applicant: $('#rechts > div:nth-child(6) > div:nth-child(4) > span:nth-child(3)').text(),
        transport: $('#rechts > div:nth-child(6) > div:nth-child(14) > span:nth-child(2)').text(),
        registration: $('#rechts > div:nth-child(6) > div:nth-child(16) > span:nth-child(2)').text(),
        refNo: $('#rechts > div:nth-child(6) > div:nth-child(16) > span:nth-child(5)').text(),
        data: $("#rechts > div:nth-child(14) > div:nth-child(5) > table").parsetable(true, true, true),
    }
    // Files
    var files = []
    var docLen = $('#contentFrame > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1)').find('a').length
    if (docLen > 0) {
        $('#contentFrame > table:nth-child(1) > tbody > tr:nth-child(2) > td:nth-child(1)').find('a').each(function () {
            var t = $(this).text().split(/\s/)
            var t = _.compact(t)
    

            files.push({
                date: t[0],
                name: t[1],
                lang: t[2].replace(/[^\w\s]/gi, ''),
                link: $(this).attr('href')
            })
        });
    }
    item.files = files;
    
    var item = Object.assign(item, general);

    // Export field
    item.type = 'acc';
    Log('success', 'Scrapping[done]: ' + chalk.cyan(item.name))
    DB.itemInsert(item, 'name')
}
/*
  Search Keyword
 */
pharma.searchItem = async (keyword, browser, page) => {
    if (!keyword) {
        Log('warning', '[searchItem] Search validation: Keyword is missing');
        return
    }
    Log('progress', 'Searching: ' + chalk.green(keyword))
    await page.focus('#\\30 ');
    await page.keyboard.down('Control');
    await page.keyboard.press('A');
    await page.keyboard.up('Control');
    await page.keyboard.press('Backspace');
    await page.keyboard.type(keyword);
    await page.select('select[name="searchField"]', "INDNR")
    await FlowPup.click(page, "#goME", 3000, 'Search Init')
    var itemsCount = '#titlesHeader > table > tbody > tr > td.wbtxt > span.wbtxt.dom_value\\:\\:getTitlesList\\(\\)\\.getCurrentResult\\(\\)\\.getHits\\(\\)'
    if (await page.$(itemsCount) === null) {
        Log('error', 'Results: 0')
        return
    } else {
        var itemsCount = await page.evaluate(() => document.querySelector('#titlesHeader > table > tbody > tr > td.wbtxt > span.wbtxt.dom_value\\:\\:getTitlesList\\(\\)\\.getCurrentResult\\(\\)\\.getHits\\(\\)').innerHTML)
        Log('success', 'Results: ' + itemsCount)
    }
    var checkElement;
    if (itemsCount <= 10) {
        checkElement = '#titlesFields > table > tbody > tr > td:nth-child(1) > input'
        // #documentDisplayButton
    } else {
        checkElement = '#titlesFields > table > tbody > tr:nth-child(2) > td:nth-child(1) > input'
    }
    // GET ItemsCount
    await FlowPup.click(page, checkElement, null, 'Event[check]:input => item')
    // New blank page for Item
    const newPagePromise = new Promise(x => browser.once('targetcreated', target => x(target.page())));
    await FlowPup.click(page, '#documentDisplayButton', 3000, '[newTab]:Opening => item');
    const newPage = await newPagePromise;
    Log('start', 'Session[open]:' + keyword + ', Results[Scrapping]: ' + itemsCount)
    // Docs[loop]
    for (var j = 1; j <= parseInt(itemsCount); j++) {
        await pharma.extractItem(newPage, keyword)
        Log('progress', 'Scrapping[current]: [ ' + chalk.bgGreen(j) + ' from ' + itemsCount + ' ] - ' + chalk.green(keyword))
        var [button] = await newPage.$x("//a[contains(., '» nächstes Dokument »')]");
        if (button) {
            await button.click();
            await newPage.waitForSelector('#contentFrame', {
                visible: true,
                timeout: 0
            });
            if (j === parseInt(itemsCount)) {
                //console.log('Scrapped done for one search:', keyword, itemsCount, 'scrapped')
                await newPage.close()
                Log('done', 'Session[closed]:' + keyword + ', Results[Scrapped]' + itemsCount)
                Drugs.update({
                    name: keyword
                }, {
                    $set: {
                        checked: true
                    }
                });
            }
        }
    }
}
/*
  Puppeteer Scrapper
 */
async function scrapPharma(url) {
    try {
        const browser = await puppeteer.launch({
            headless: true,
            args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
                '--disable-dev-shm-usage',
                '--no-first-run',
                '--no-zygote',
                '--single-process',
            ],
        });
        Log('progress', 'Browser init.....')
        const page = await browser.newPage();
        await page.setUserAgent('Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 (KHTML, like Gecko) HeadlessChrome/67.0.3372.0 Safari/537.36');
        await FlowPup.goto(url, page)
        Log('progress', 'Browser steps: Main URL')
        let el = '#center_container > div:nth-child(2) > table > tbody > tr > td:nth-child(2) > div > form > div > input.button'
        await FlowPup.click(page, el, 5000, 'Step[1] => Event[click] Selection')
        Log('progress', 'Pharma: Aggrement[Loading]')
        // Accept
        page.waitForSelector('#clause', {
            visible: true,
            timeout: 0
        });
        var elem = '#clause > div > div > table:nth-child(2) > tbody > tr.dom_if\\:\\:\\!getApplInfo\\(\\)\\.isFZKNavigationDisabled\\(\\) > td:nth-child(2) > a.wbbluebutton.dom_action\\:\\:AcceptFZK.dom_translate\\:\\:amis\\.clause\\.accept';
        await FlowPup.click(page, elem, 3000, 'Step[2] => Event[click] Aggrement[Accept]')

        await page.screenshot({
            path: path + 'test-1.png',
            fullPage: true
        });
        // Search page
        // ==> Search Drugs
        /*
          [start] TEST
        */
        if (isTest) {
            Log('warning', 'Drugs[SET] Sample')
            var drugs = codeSample;
        } else {
            var drugsDB = Drugs.find({
                checked: {
                    $ne: true
                }
            }).fetch();
            Log('warning', 'Drugs[SET] DB')
            var drugs = codeSample;
        }
        /*
          [end] TEST
        */
        if (!drugs.length) {
            Log('error', 'Scrap: DrugsArr is not defined')
        }
        for (var i = 0; i <= drugs.length; i++) {
            console.log('ScrapCon: Drugs.len', drugs.length, 'Drug', drugs[i])
            if (i === drugs.length || !drugs[i]) {
                await browser.close()
                Log('done', 'All drugs has been scrapped')
                  // Write Files
                  await App.writeFile('/exports/acc-code.json', JSON.stringify(Items.find({
                    type: 'acc'
                  }).fetch()));
                log('================================================================')
                return
            } else {
                // 
                if (isTest) {
                    Log('step', 'Passing Search Test')
                    await pharma.searchItem(drugs[i], browser, page)
                } else {
                    await pharma.searchItem(drugs[i].name, browser, page)
                }
            }
        }
        // end loop
    } catch (error) {
        log('error', error)
    }
}