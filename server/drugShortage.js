/**
 * 
 * Drugs Scrapper for: drugshortage.ch
 * 
 * 
 */
import {
    Meteor
} from 'meteor/meteor';
import './collections.js';
import Log from './log.js';
import './db.js'
import './util.js'
import './db.js'
import FlowPup from './flowPub.js'
const _ = require("lodash")
const fs = require('fs')
const scrapeIt = require("scrape-it")
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const cheerioTableparser = require('cheerio-tableparser')
/**
 * Project Settings
 */
const rootURL = 'https://drugshortage.ch/'
const baseURL = 'https://drugshortage.ch/UebersichtaktuelleLieferengpaesse2.aspx'
var drugsCollection = []
var counter = 0 ;
/**
 * 
 */
 if(Meteor.settings.drugShortage){
     Log('start','Scrapping: drugshortage.ch')
     scrapper(baseURL)
 }
 /**
  * 
  */
 async function scrapper(url, type, lang) {
    Log("start",'Scrapper is starting')
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
    // 
    await page.goto(url, {
        waitUntil: 'load'
    });
    let content = await page.content();
    var $ = cheerio.load(content);
    var tr = '#GridView1 > tbody > tr';
    var drugsTableData = []
    /**
     * 
     */
    $(tr).each(function (index) {
        Log('step','Drug number' + index)
        var data = {}
        data.id = index;
        data.bezeichnung = $(this).find('td:nth-child(1)').text()
        data.detailsLink = rootURL + $(this).find('td:nth-child(1) > a').attr('href')
        data.gtin = $(this).find('td:nth-child(2)').text()
        data.pharmacode = $(this).find('td:nth-child(3)').text()
        data.firma = $(this).find('td:nth-child(4)').text()
        data.datumLetzteMutation = $(this).find('td:nth-child(5)').text()
        data.tageSeitSrsterMeldung = $(this).find('td:nth-child(6)').text()
        data.status = $(this).find('td:nth-child(7)').text()
        data.datumLieferfahigkeit = $(this).find('td:nth-child(8)').text()
        Log('start','Scrapping' + data.bezeichnung)
        console.log(data)
        Log('Success','Scrapping' + data.bezeichnung)
        if(data.bezeichnung){
            drugsTableData.push(data)
        }
    })
    /**
     * 
     */
    Log('success', 'Scrapping is finished Data collected:' + drugsTableData.length )
    Log('warning', 'Writing the file: drugshortage.json')
    await App.writeFile('/exports/drugshortage.json', JSON.stringify(drugsTableData));
    Log('success', 'The file is ready at /exports/drugshortage.json' + drugsTableData.length)
    await browser.close();
    console.log('Meteor Exit.')
    process.exit(0)
    /**
     * Used for scrapping the Details page product
     */
    var drugsArr = await page.evaluate(() => Array.from(document.querySelectorAll('#GridView1 > tbody > tr > td:first-child'), 
    //element.textContent.trim()
     element => element.innerHTML
     )
    );
    //drugsArr, 
    if(drugsArr.length){
        _.each(drugsArr,(drug)=>{
            var drugObject = getLinkObject(drug)
            drugsCollection.push(drugObject)
        })
    }
    /**
     * 
     */
    for(i = 0; i <= drugsCollection.length; i ++){
        var link = rootURL + drugsCollection[i].link
        Log('start', 'Scrapping:' + drugsCollection[i].text )
        await page.waitFor(_.random(1500,3600))
        await page.goto(link, {
            waitUntil: 'load'
        });
        /**
         * 
         */
        let content = await page.content();
        var $ = cheerio.load(content);
        var tr = '#DetailsView1 > tbody > tr';
        var tableData = []
        $(tr).each(function () {
            var data = {}
            data.key = $(this).find('td:nth-child(1)').text()
            data.value = $(this).find('td:nth-child(2)').text()
            // console.log(data)
            tableData.push(data)
        })
        var updatedObj = drugsCollection[i]
        updatedObj._id = i;
        updatedObj.data = tableData;
        drugsCollection.splice(i,1, updatedObj)
        // index test
        Log('end', 'Success:' + drugsCollection[i].text )
        console.log(i, drugsCollection[i])
    }
    Log('success', 'Scrapping is finished')
    Log('warning', 'Writing the file: drugshortage.json')
    await App.writeFile('/exports/drugshortage.json', JSON.stringify(drugsCollection));
 }
 /**
  * 
  */
  function getLinkObject(link){
    let $ = cheerio.load(link)
    return {
        // link: match[1],
        text: $.text(),
        link: $(link).attr('href')
        // text: t[1]
    }
  }
  /**
   * Get the table data
   */
   function getTableData(table){
   }