/*
    Scrapping Drug Details from: https://www.pharmnet-bund.de
*/
import './collections.js'
import './db.js'
import './app.js'
import Log from './log.js'
const fs = require("fs");
const _ = require('lodash')
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
cheerioTableparser = require('cheerio-tableparser')
//
var path = process.env['METEOR_SHELL_DIR'] + '/../../../exp/';
var root = process.env['METEOR_SHELL_DIR'] + '/../../../';
//
var drugsSample = ['5', 'AARANE', 'AMOXIBETA', 'AMISULPRID', 'OUSJAKLLS' ,'AMITRIPTYLIN-NEURAX', 'AMLODIGAMMA TOP', 'AMLODIPIN/VALS', 'AMOXIHEXAL', 'ACC'];
/*
*/
let isTest = false;
let isClean = false;
/*
  Drugs
*/
var drugs;
/*
  ====Flow Init
 */
FlowPup = {}
/*
  ====Pharma Specific
 */
pharma = {}
pharma.root = 'https://portal.dimdi.de';
pharma.entry = 'https://www.pharmnet-bund.de/dynamic/de/arzneimittel-informationssystem/index.html'
/*
  =====TESTING
*/
FlowPup.clean = ()=>{
  Log('progress', 'Cleaning DB; Drugs/ Items[Pharma')
  Drugs.remove({})
  Items.remove({type:'pharma'},{multi:true})
  Log('done', 'Cleaning DB; Drugs/ Items[Pharma')
}
if(isClean){
  FlowPup.clean()
}
/*
  =====Run Pharma Project
*/
let isPharma = Meteor.settings.isPharma
if (isPharma) {
  log('start','Pharma Scrapping init')
  if(isTest){
    Log('start',chalk.yellow('......TESTING MODE.......'))
  }else{
    Log('start','......RUN MODE.......')
  }
   initCheck()
}
//
/*
  Insert All drugs into Collection
*/
async function initCheck() {
  if (fs.existsSync(root + '/private/prodname_unique.txt')) {
    Log('success', 'Drug file exists')
  } else {
    Log('error', chalk.red('Drugs file does not exist in /private; Add "prodname_unique.txt" in /private'))
    return
  }
  var meds = Assets.getText('prodname_unique.txt')
  var meds = meds.split("\n");
  var meds = _.compact(meds)
  Log('progress', 'Checking Drugs:Products Files, Content: ' + meds.length)
  console.log('Drugs File:DB => ',meds.length, ' : ' , Drugs.find().count())
  if (meds.length !== Drugs.find().count()) {
    Log('warning', 'Drugs[file]: Has new data Updating Drugs')
    await DB.batchDrugs(meds)
  }
    await scrapPharma(pharma.entry)
    await App.writeFile('/exports/pharma.json', JSON.stringify(Items.find({
      type: 'pharma'
    }).fetch()))
    await App.exit()
}
/*
 */
FlowPup.goto = async (url, page, delay) => {
  await page.goto(url, {
    waitUntil: 'load'
  });
}
/*
  Screenshot for debugging
 */
FlowPup.screenshot = async (page, file, fullpage) => {
  if (!page || !file || (/\.(gif|jpg|jpeg|tiff|png)$/i).test(file) == false) {
    console.log('Error in image file or connection')
    return
  };
  Log('screen', 'Screenshot saved:' + file)
  await page.screenshot({
    path: path + file,
    fullPage: fullpage
  });
}
/*
 */
FlowPup.click = async (page, el, delay, msg) => {
  await page.click(el);
  Log('step', 'Event[click]: ' + msg)
  if (delay && Number.isInteger(delay)) {
    //console.log('Clicked: el', el, 'loading...', delay)
    await page.waitFor(delay);
  }
}
/*
  Extracting Item from a Page
 */
FlowPup.extractItem = async (page, keyword) => {
  //
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
  item.type = 'pharma';
  Log('success', 'Scrapping[done]: ' + chalk.cyan(item.name))
  // DB[Insert]
  DB.itemInsert(item, 'number')
}
/*
  Search Keyword
 */
FlowPup.searchItem = async (keyword, browser, page) => {
  if (!keyword) {
    Log('warning', '[searchItem] Search validation');
    return
  }
  Log('progress', 'Searching: ' + chalk.green(keyword))
  await page.focus('#\\30 ');
  await page.keyboard.down('Control');
  await page.keyboard.press('A');
  await page.keyboard.up('Control');
  await page.keyboard.press('Backspace');
  await page.keyboard.type(keyword);
  await FlowPup.click(page, "#goME", 3000, 'Search Init')
  //
  //await FlowPup.screenshot(page, 'ARR.png', true)
  // await page.waitForSelector('#documentDisplayButton', {
  //   visible: true,
  //   timeout: 0
  // });
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
    await FlowPup.extractItem(newPage, keyword)
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
    await FlowPup.goto(url, page)
    Log('progress', 'Browser steps: Main URL')
    let el = '#inhalt form input.button'
    await FlowPup.click(page, el, 5000, 'Step[1] => Event[click] Selection')
    Log('progress', 'Pharma: Aggrement[Loading]')
    // Accept
    page.waitForSelector('#clause', {
      visible: true,
      timeout: 0
    });
    var elem = '#clause > div > div > table:nth-child(2) > tbody > tr.dom_if\\:\\:\\!getApplInfo\\(\\)\\.isFZKNavigationDisabled\\(\\) > td:nth-child(2) > a.wbbluebutton.dom_action\\:\\:AcceptFZK.dom_translate\\:\\:amis\\.clause\\.accept';
    await FlowPup.click(page, elem, 3000, 'Step[2] => Event[click] Aggrement[Accept]')
    // Search page
    // ==> Search Drugs
    /*
      [start] TEST
    */
    if(isTest){
      Log('warning','Drugs[SET] Sample')
      var drugs = drugsSample;
    }else{
      var drugsDB = Drugs.find({
        checked: {
          $ne: true
        }
      }).fetch();   
      Log('warning','Drugs[SET] DB')
      var drugs = drugsDB;
    }
    /*
      [end] TEST
    */
    if(!drugs.length){
      Log('error','Scrap: DrugsArr is not defined')
    }
    for (var i = 0; i <= drugs.length; i++) {
      console.log('ScrapCon: Drugs.len',drugs.length, 'Drug', drugs[i])
      if (i === drugs.length || !drugs[i]) {
        await browser.close()
        Log('done', 'All drugs has been scrapped')
        return
      } else {
        if(isTest){
          await FlowPup.searchItem(drugs[i], browser, page)
        }else{
          await FlowPup.searchItem(drugs[i].name, browser, page)  
        }
      }
    }
    // end loop
  } catch (error) {
    log('error', error)
  }
}