/**
 * 
 */
const _ = require("lodash")
const cheerio = require('cheerio');
const puppeteer = require('puppeteer');
const cheerioTableparser = require('cheerio-tableparser')




// const xmltwojs = require('xmltwojs');
import Log from './log.js';
import './util.js'
/**
 * Project Settings
 */
const rootURL = 'https://www.pei.de/'
const baseURL = 'https://www.pei.de/DE/arzneimittel/impfstoffe/lieferengpaesse/lieferengpaesse-node.html'
const feed = 'https://www.pei.de/SiteGlobals/Functions/RSSFeed/RSSGenerator_Lieferengpaesse.xml?nn=11245362';
const fileName = "impfstoffe_deutschland_lieferengpass.json"
var drugsCollection = []
var counter = 0;



/**
 * 
 */
if (Meteor.settings.isPei) {
    Log('start', 'Scrapping: drugshortage.ch')
    scrapper(baseURL)
}
/**
 * 
 * @param {*} url 
 */
/**
 * 
 * @param {*} url 
 */
async function scrapper(url) {
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

    // 
    await page.goto(feed, {
        waitUntil: 'load'
    });
    var content = await page.content();
    // console.log(content)
    var $ = await cheerio.load(content, { xmlMode: true });
    var items = $('item')

    var rows = []

    


    $('item').each((index, item)=>{
        var obj = {}
        obj.name = $(item).find('title').text()
       _.map($(item).find('description').text().split(","), function(i){
            var n = i.split(":")
            obj[_.trim(n[0])] = n[1]
        })
        obj.link = $(item).find('link').text()
        obj.id = obj.link.split('#')[1]
        console.log(obj)
        rows.push(obj)
    })



    await App.writeFile('/exports/FEED_impfstoffe_deutschland_lieferengpass.json' + fileName, JSON.stringify(rows));
    process.exit(0)
    return
    // //
    await page.goto(url, {
        waitUntil: 'load'
    });
    var content = await page.content();
    await getTableData(content)
    await browser.close();
    console.log('Meteor Exit.')
    process.exit(0)
}
/**
 * getTableData
 */
async function getTableData(pageContent) {
    var $ = await cheerio.load(pageContent);

    // getting rows ids 
    var ids = []
    $('tr').each((row)=>{
        console.log($(row).find('td').length)
        if($(row).prop('id')){
            console.log('has ID',$(row).prop('id'))
            ids.push($(row).attr('id'))
        }
    })

    


    return
    console.log('Table count', $('.gsb .c-table table').length)
    var tables = []
    $('.gsb .c-table table').each(function (index, elm) {
        head = []
        $(elm).find('th').each(function (index, elm) {
            var h = $(elm).text().trim()
            var h = h.replace(/(\r\n|\n|\r)/gm, "");
            // head.push(string_to_slug(h))
            head.push(h)
        })
        var rows = [];
        if ($(elm).find('tr').length !== 0) {
            console.log('row length', $(elm).find('tr').length)
            $(elm).find('tr').each(function (c, n) {
                console.log('row lenght td', $(n).find('td').length)
                console.log('row id', $(n).prop('id'))
                if($(n).prop('id')){
                    console.log('row tds', $(n).find('td').length)
                    for (i = 0; i < $(n).find('td').length; i++) {
                        rows.push({
                            id: i,
                            key: head[i],
                            value: $(n).text()
                        })
                    }
                }

            });
        } else {
            console.log('Row length EMPTY', $(elm).find('tr').length)
        }
        // console.log('rows',head)
        // console.log('rows',rows)
        console.log('New Table')
        tables.push(rows)
    })
    //  console.log(tables)
    Log('success', 'Scrapping is finished Data collected https://www.pei.de/ :' + tables.length)
    Log('warning', 'Writing the file: impfstoffe_deutschland_lieferengpass.json')
    await App.writeFile('/exports/' + fileName, JSON.stringify(tables));
    Log('success', 'The file is ready at /exports/impfstoffe_deutschland_lieferengpass.json' + tables.length)
}
/**
 * 
 * @param {*} str 
 */
function string_to_slug(str) {
    str = str.replace(/^\s+|\s+$/g, ''); // trim
    str = str.toLowerCase();
    // remove accents, swap ñ for n, etc
    var from = "àáäâèéëêìíïîòóöôùúüûñç·/_,:;";
    var to = "aaaaeeeeiiiioooouuuunc------";
    for (var i = 0, l = from.length; i < l; i++) {
        str = str.replace(new RegExp(from.charAt(i), 'g'), to.charAt(i));
    }
    str = str.replace(/[^a-z0-9 -]/g, '') // remove invalid chars
        .replace(/\s+/g, '-') // collapse whitespace and replace by -
        .replace(/-+/g, '-'); // collapse dashes
    return str;
}
/**
 * 
 * $("tr").each(function(i,e){
       if($(e).attr('id')){
		console.log($(e).text())
          //do something and check
          //if you want to break the each
          //return false;
       }
   });
 */
