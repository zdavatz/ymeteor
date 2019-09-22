import './config.js';
import './collections.js';
import './db.js'
import YAML from 'yaml';
import log from './log.js'
const cheerio = require('cheerio');
// import URLS from './urls.yaml'
// log('progress',URLS)
const _ = require("lodash")
const fs = require('fs')
const scrapeIt = require("scrape-it")
const puppeteer = require('puppeteer');
/*
  Project Specifics
*/
var Project = YAML.parse(Assets.getText('urls.yaml'))
// Public Directory Path
var path = process.env['METEOR_SHELL_DIR'] + '/../../../public/';
let root = 'https://www.swissmedic.ch';
let swissList = 'https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/marktueberwachung/qualitaetsmaengel-und-chargenrueckrufe/chargenrueckrufe.html';
let qa = 'https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/marktueberwachung/health-professional-communication--hpc-.html';
let frDrugs = 'https://www.swissmedic.ch/swissmedic/fr/home/humanarzneimittel/marktueberwachung/qualitaetsmaengel-und-chargenrueckrufe/chargenrueckrufe.html';
let frDocs = 'https://www.swissmedic.ch/swissmedic/fr/home/humanarzneimittel/marktueberwachung/health-professional-communication--hpc-.html';
/*
 */
Counter = 0;
/*
  ===
*/
Swiss = {}
/*
 */
let isSwiss = Meteor.settings.isSwiss
if (isSwiss) {
  log('start', 'SwissMedic.ch Scrapping init')
  runScrapper()
}
/*
 */
Swiss.scrapURL = (url, id) => {}
/*
  Basic App Actions
*/
Swiss.patch = (data, type, lang) => {
  _.each(data, (item) => {
    let isExist = Items.findOne({
      title: item.title
    })
    let exclude = ["KPA Breakout Session – Präsentationen", "Newsdienste – Newsletter abonnieren"]
    // TESTING
    if (isExist && exclude.indexOf(item.title) == -1) {
      item.type = type;
      item.lang = lang;
      item.url = root + item.url;
      var id = Items.insert(item)
      // Scrap DRUG
      Swiss.scrapDrug(item.url, id)
    }
  })
}
/* 
  Write file to Disk
  => ('/export/FILENAME',data)
*/
Swiss.writeFile = async (file, data) => {
  await fs.writeFile(path + file, data, (err) => {
    if (err) log('error', err);
    log('progress', "File updated" + file);
  });
}
/* 
  Get Exported Files
  => [file1,file2]
*/
Swiss.getFiles = async (dir) => {
  if (!dir) return;
  return fs.readdirSync(path + dir)
}
/*
  getItems
    - Fetch collection with certain values
*/
Swiss.getItems = async (type, lang) => {
  return Items.find({
    lang: lang,
    type: type
  }).fetch()
}
/*
  Custom Single Link Scrapper 
    - Puppeteer 
*/
Swiss.scrapDrug = async (url, id) => {
  scrapeIt(url, {
    title: ".mod h1",
    desc: ".mod-text article",
    content: '.mod-layout .mod-text p',
    date: '.mod.mod-headline',
    pdf: {
      selector: ".mod-download a",
      attr: "href"
    },
    prep: {
      listItem: '.table-simple tr',
      data: {
        prop: {
          selector: ':nth-child(1)'
        },
        field: {
          selector: ':nth-child(2)'
        }
      }
    }
  }).then(({
    data,
    response
  }) => {
    data.pdf = root + data.pdf
    var item = Items.findOne({
      _id: id
    });
    var date = item.date[0]
    var date = date.replace(/\n/, ' ');
    // #6
    data.date = date;
    log('progress', `Scrapped:` + data.date + ' ' + data.title)
    Items.update({
      _id: id
    }, {
      $set: data
    })
    //
    log('success', `DB-Updated:` + data.date + ' ' + data.title)
  })
}
/*
  Runner
*/
async function SwissRun() {
  await scrapper(swissList, 'drug', 'de')
  await scrapper(qa, 'doc', 'de')
  await scrapper(frDrugs, 'drug', 'fr')
  await scrapper(frDocs, 'doc', 'fr')
}
Swiss.record = async () => {
  log('progress', 'Progress: Getting files ready')
  //Meteor.setTimeout(function () {
  await Swiss.writeFile('/exports/chargenrueckrufe_de.json', JSON.stringify(Swiss.getItems('drug', 'de')))
  await Swiss.writeFile('/exports/dhcp_hcp_de.json', JSON.stringify(Swiss.getItems('doc', 'de')))
  // French
  await Swiss.writeFile('/exports/chargenrueckrufe_fr.json', JSON.stringify(Swiss.getItems('drug', 'fr')))
  await Swiss.writeFile('/exports/dhcp_hcp_fr.json', JSON.stringify(Swiss.getItems('doc', 'fr')))
}
/*
meteor | sed -e '/Exited with code/q'
*/
Swiss.close = async () => {
  process.exit(0)
  process.kill(process.pid)
}
/*
  Pupeeter Scrapper
*/
async function scrapper(url, type, lang) {
  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-gpu',
      '--disable-dev-shm-usage',
      '--no-first-run',
      '--no-zygote',
      '--single-process',
    ],
  });
  const page = await browser.newPage();
  await page.setViewport({
    width: 1280,
    height: 720
  });
  await page.goto(url, {
    waitUntil: 'load'
  });
  await page.waitForSelector(".mod-teaser")
  //var navx = Array.from(await page.$$('nav a'))
  const nav = await page.evaluate(() => {
    var nav = document.querySelectorAll('a[data-loadpage]')
    var nav = [].map.call(nav, a => a.getAttribute("data-loadpage"));
    var nav = nav.filter(function (e) {
      return e !== 0
    })
    var nav = nav.filter((x, i, a) => a.indexOf(x) == i)
    return nav;
  })
  if(!nav.length){
    log('error','Checking; There is no navigation')
    return
  }
  //
  for (var i = 1; i < nav.length; i++) {
    //
    const dimensions = await page.evaluate(() => {
      var nav = document.querySelectorAll('a[data-loadpage]')
      var title = document.querySelectorAll('.mod-teaser a')
      var dates = document.querySelectorAll('.mod-teaser')
      //
      var items = []
      var nav = [].map.call(nav, a => a.getAttribute("data-loadpage"));
      var nav = nav.filter(function (e) {
        return e !== 0
      })
      var nav = nav.filter((x, i, a) => a.indexOf(x) == i)
      for (var i = 0; i < title.length; i++) {
        var item = {
          title: title[i].innerHTML,
          url: title[i].getAttribute('href')
        }
        var date = dates[i].innerHTML
        var date = date.replace(/<[^>]*>?/gm, '')
        var date = date.replace(/^\s+|\s+$/g, '')
        var date = date.split(" ")
        item.date = date;
        items.push(item)
      }
      return {
        items: items,
        nav: nav,
      };
    });
    //
    if (dimensions.items && dimensions.items.length) {
      Swiss.patch(dimensions.items, type, lang)
    }
    if (dimensions && dimensions.items) {
      log('progress', 'Scrapped Items:' + dimensions.items.length);
    }
    var resultsBox = 'a[data-loadpage = "' + i + '"]'
    if (await page.$(resultsBox) === null || i === nav.length) {
      log('warning', 'Scanning...');
      log('progress', 'Next project');
      return
    }
    if (i !== 1) {
      await page.click('a[data-loadpage = "' + i + '"]');
      log('step','Next Page [loading...]')
      await page.waitFor(5000, {
        waitUntil: 'domcontentloaded',
        timeout: 0
      });
    }
  }
  await browser.close();
  Counter = Counter + 1;
  log('success', 'Project ' + Counter + ' is finished')
}
/*
 */
async function runScrapper() {
  await SwissRun()
  await Swiss.record()
  await log('success', 'Scrapping is finished, You may close meteor')
  await Swiss.close()
}
/*
  CronJobs
*/
/*
  Test
*/
if (process.pid) {
  log('progress', 'This process is your pid ' + process.pid);
}
/*
  Methods
*/
Meteor.methods({
  getFiles() {
    return Swiss.getFiles('exports')
  }
})