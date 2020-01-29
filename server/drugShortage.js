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
import FlowPup from './flowPub.js'
import { chown } from 'fs';
import { constants } from 'buffer';
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
var counter = 0;
/**
 * 
 */
if (Meteor.settings.drugShortage) {
    Log('start', 'Scrapping: drugshortage.ch')
    scrapper(baseURL)
}
/**
 * 
 */
async function scrapper(url, type, lang) {
    Log("start", 'Scrapper is starting')
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
    /** Company table */
    // Indicator #GridView5
    // Company Table: #GridView2 
    /** Products table */
    var tr = '#GridView1 > tbody > tr';
    var drugsTableData = []
    /**
     * 
     */
    // return 
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
        data.tageSeitErsterMeldung = $(this).find('td:nth-child(6)').text()
        data.status = $(this).find('td:nth-child(7)').text()
        data.datumLieferfahigkeit = $(this).find('td:nth-child(8)').text()

        // Company
        var head = getTableHead($ , '#GridView2')
        var row = getCompanyData(content, '#GridView2' , data.firma)
        console.log('getCompanyData start', data.firma)
        console.log('getCompanyData result',row)
        if(row){
            data.company = joinCol(head,row)
            console.log('CompanyObject',data.company)
    
    
            console.log('Company Object generated')
            console.log('Getting Color Code', row[0], data.firma)
            var colorObj= getColorIndicator(row[0],content)
            if(colorObj){
                var colorHead = getTableHead($ , '#GridView5')
                var colorCode = joinCol(colorHead,colorObj)
                data.colorCode = colorCode;
                console.log('===== colorCode Success ===== ')
            }else{
                console.log('******************Color is not found********************')
            }

        }else{
            console.log('error','******************Company is not defined********************')
            data.company = {}
            data.colorCode = {}
        }

        // End of Company and Color Code
        Log('start','Scrapping' + data.bezeichnung)
        console.log(data)
        Log('Success', 'Scrapping' + data.bezeichnung)
        if (data.bezeichnung) {
            drugsTableData.push(data)
        }
    })
    /**
     * 
     */
    Log('success', 'Scrapping is finished Data collected:' + drugsTableData.length)
    Log('warning', 'Writing the file: drugshortage.json')
    await App.writeFile('/exports/drugshortage.json', JSON.stringify(drugsTableData));
    Log('success', 'The file is ready at /exports/drugshortage.json : ' + drugsTableData.length)
    await browser.close();
    console.log('Meteor Exit.')
    process.exit(0)
    /**
     * Used for scrapping the Details page product
     */
    var drugsArr = await page.evaluate(() => Array.from(document.querySelectorAll('#GridView1 > tbody > tr > td:first-child'),
        //element.textContent.trim()
        element => element.innerHTML
    ));
    //drugsArr, 
    if (drugsArr.length) {
        _.each(drugsArr, (drug) => {
            var drugObject = getLinkObject(drug)
            drugsCollection.push(drugObject)
        })
    }
    /**
     * 
     */
    for (i = 0; i <= drugsCollection.length; i++) {
        var link = rootURL + drugsCollection[i].link
        Log('start', 'Scrapping:' + drugsCollection[i].text)
        await page.waitFor(_.random(1500, 3600))
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
        drugsCollection.splice(i, 1, updatedObj)
        // index test
        Log('end', 'Success:' + drugsCollection[i].text)
        // console.log(i, drugsCollection[i])
    }
    Log('success', 'Scrapping is finished')
    Log('warning', 'Writing the file: drugshortage.json')
    await App.writeFile('/exports/drugshortage.json', JSON.stringify(drugsCollection));
}
/**
 * 
 */
function getLinkObject(link) {
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
function getTableData(table) {}
/**
 * Get Company row data 
 *   => obj
 * #GridView2 
 */
function getCompanyData(content, table ,company) {
    var r;
    var $ = cheerio.load(content);
    var tr = table + '> tbody > tr';
    $(tr).each(function(index){
        if ($(this).find('td').eq(1).text() == company) {
            console.log('TD check SUCCESS', index, $(this).find('td').eq(1).text(), "===", company)
            var row = rowToObject(this,index)
            console.log('ROWOBJE', row)
            r = row
        }
    })
    if(r){
        Log('Success', 'Company Found',r)
        return r
    }
    
}
/**
 * 
 * @param {*} elmTr: $(element)
 * @param {*} rowIndex (index)
 * @param {*} head 
 */
function rowToObject(elmTr,rowIndex,head){
    $ = cheerio.load(elmTr)
    // console.log('TD NEXT', $('td').eq(1).text())
    var row = []
    _.each($('td'),(td,index)=>{
        if(index == 0){
            var t = $(td).css("background-color")
        }else{
            var t = $(td).text()
        }
        var t = $(td).text()
        row.push(t)
    })
    return row
}
/**
 * 
 */
 function getTableHead($, table){
    var head = []
    $(table +'> tbody > tr:nth-child(1)').find('th').each(function() {
        head.push($(this).text().trim())
    });                     
    // console.log('getTableHead: head',head)
    return head;
 }
 /**
  * 
  * joinCol(["name","job"],["hamza","doc"])
  */
 function joinCol(head,row){
    var obj = {}
    for(i = 0; i < head.length; i ++){
        if(!head[i]){
            console.log('*joinCol: Setting Number')
            obj["#"] = row[i]
        }else{
            obj[head[i]] = row[i]
        }
    }
    return obj;
 }
/**
 * 
 */
 function getColorIndicator(rowColorCode,content){
     if(!rowColorCode){
         return
     }
     console.log('getColorIndicator: rowIndex',rowColorCode)
     var r;
     var $ = cheerio.load(content);
     var tr =  '#GridView5 > tbody > tr';
     $(tr).filter(function(index){
         if ($(this).find('td').eq(0).text() == rowColorCode) {
             console.log('TD check getColorIndicator', index, $(this).find('td').eq(1).text(), "===", rowColorCode)
             var row = rowToObject(this,index)
             console.log('getColorIndicator', row)
             r = row
         }
     })
     
     if(!r){
        console.log('ColorCodeRow: Error Not found', rowColorCode)
        return
     }else{
        console.log('ColorCodeRow: Success ' )
        return r
     }
 }
