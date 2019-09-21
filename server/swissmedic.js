import './config.js';
import './collections.js';
import './db.js'
import YAML from 'yaml';
import log from './log.js'

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
if(isSwiss){
  runScrapper()
}
log('start','SwissMedic.ch Scrapping init')
/*
  Development
*/
/*
  Basic App Actions
*/
Swiss.patch = (data, type, lang) => {
  _.each(data, (item) => {
    let isExist = Items.findOne({
      title: item.title
    })
    let exclude = ["KPA Breakout Session – Präsentationen", "Newsdienste – Newsletter abonnieren"]
    if (!isExist && exclude.indexOf(item.title) == -1) {
      item.type = type;
      item.lang = lang;
      item.url = root + item.url;
      var id = Items.insert(item)
      Swiss.scrapDrug(item.url, id)
    }
  })
}
/* 
  Write file to Disk
  => ('/export/FILENAME',data)
*/
Swiss.writeFile = async(file, data) => {
  await fs.writeFile(path + file, data, (err) => {
    if (err) log('error',err);
    log('progress',"File updated" + file);
  });
}
/* 
  Get Exported Files
  => [file1,file2]
*/
Swiss.getFiles = async(dir) => {
  if (!dir) return;
  return fs.readdirSync(path + dir)
}
/*
  getItems
    - Fetch collection with certain values
*/
Swiss.getItems = async(type, lang) => {
  return Items.find({
    lang: lang,
    type: type
  }).fetch()
}
/*
  Custom Single Link Scrapper 
    - Puppeteer is NOT required
*/
Swiss.scrapDrug = async(url, id) => {
  scrapeIt(url, {
    title: ".mod h1",
    date: '.mod-headline h5',
    desc: ".mod-text article",
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
    log('progress',`Scrapping:` +  data.title)
    //log('progress',`Scrapping status: ${response.statusCode}`)
    data.pdf = root + data.pdf
    Items.update({
      _id: id
    }, {
      $set: data
    })
  })
}
/*
  Runner
*/
async function SwissRun(){
  await scrapper(swissList, 'drug', 'de')
  await scrapper(qa, 'doc', 'de')
  await scrapper(frDrugs, 'drug', 'fr')
  await scrapper(frDocs, 'doc', 'fr')
}
Swiss.record = async() => {
  log('progress','Progress: Getting files ready')
  //Meteor.setTimeout(function () {
  await Swiss.writeFile('/exports/chargenrueckrufe_de.json', JSON.stringify(Swiss.getItems('drug', 'de')))
  await Swiss.writeFile('/exports/dhcp_hcp_de.json', JSON.stringify(Swiss.getItems('doc', 'de')))
  // French
  await Swiss.writeFile('/exports/chargenrueckrufe_fr.json', JSON.stringify(Swiss.getItems('drug', 'fr')))
  await Swiss.writeFile('/exports/dhcp_hcp_fr.json', JSON.stringify(Swiss.getItems('doc', 'fr')))
    //Swiss.close()
  //}, 5000)
}
/*
meteor | sed -e '/Exited with code/q'
*/
Swiss.close = async ()=>{
  process.exit(0)
  process.kill(process.pid)
}
/*
  Pupeeter Scrapper
*/
async function scrapper(url, type, lang){
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
  await page.goto(url, {
    waitUntil: 'load'
  });
  await page.waitForSelector(".mod-teaser")
  for (var i = 1; i < 7; i++) {
    if (i !== 1) {
      var resultsBox = 'a[data-loadpage = "' + i + '"]'
      if (await page.$(resultsBox) === null){
        log('warning','Scanning....');
        return   
      }
      await page.click('a[data-loadpage = "' + i + '"]');
      await page.waitFor(3000);
    }
    const dimensions = await page.evaluate(() => {
      var nav = document.querySelectorAll('a[data-loadpage]')
      var ax = document.querySelectorAll('.mod-teaser')
      var title = document.querySelectorAll('.mod-teaser a')
      var items = []
      var nav = [].map.call(nav, a => a.getAttribute("data-loadpage"));
      var nav = nav.filter(function (e) {
        return e !== 0
      })
      var nav = nav.filter((x, i, a) => a.indexOf(x) == i)
      for (var i = 0; i < ax.length; i++) {
        items.push({
          title: title[i].innerHTML,
          url: title[i].getAttribute('href')
        })
      }
      return {
        items: items,
        nav: nav,
      };
    });
    //_.each(docs)
    if (dimensions.items && dimensions.items.length) {
      Swiss.patch(dimensions.items, type, lang)
    }
    if (dimensions && dimensions.items) {
      log('progress','Scrapped Items:' + dimensions.items.length);
    }
  }
  await browser.close();
  Counter = Counter + 1;
  log('success','Project ' + Counter + ' is finished')
  //log('progress','Type:' + type + '& Lang:', lang)
  //if(Counter == 4){
  //}
}
/*
*/
async function runScrapper(){
  await SwissRun()
  await Swiss.record()
  await log('success','Scrapping is finished, You may close meteor')
  await Swiss.close()
}
/*
  CronJobs
*/
// SyncedCron.add({
//   name: 'Crunch some important numbers for the marketing department',
//   schedule: function (parser) {
//     return parser.text('every 12 hours');
//   },
//   job: function () {
//     log('progress','Running......')
//     Swiss.run()
//   }
// });
// SyncedCron.start();
/*
  Test
*/
if (process.pid) {
  log('progress','This process is your pid ' + process.pid);
}
/*
  Methods
*/
Meteor.methods({
  getFiles() {
    return Swiss.getFiles('exports')
  },
  getLatest() {},
  getStats() {},
  fileDownload() {}
})