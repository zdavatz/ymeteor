import {
    Meteor
} from 'meteor/meteor';
import './config.js'
import YAML from 'yaml'
import './collections.js'
import moment from 'moment';

// import URLS from './urls.yaml'
// console.log(URLS)
const _ = require("lodash")
const fs = require('fs')
const scrapeIt = require("scrape-it")
const puppeteer = require('puppeteer');

log = console.log
/*
  Project Specifics
*/
var Project = YAML.parse(Assets.getText('urls.yaml'))
// Public Directory Path
var path = process.env['METEOR_SHELL_DIR'] + '/../../../public/';
let rootURL = 'https://www.swissmedic.ch';
// 
let swissList = 'https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/marktueberwachung/qualitaetsmaengel-und-chargenrueckrufe/chargenrueckrufe.html';
let qa = 'https://www.swissmedic.ch/swissmedic/de/home/humanarzneimittel/marktueberwachung/health-professional-communication--hpc-.html';
let frDrugs = 'https://www.swissmedic.ch/swissmedic/fr/home/humanarzneimittel/marktueberwachung/qualitaetsmaengel-und-chargenrueckrufe/chargenrueckrufe.html';
let frDocs = 'https://www.swissmedic.ch/swissmedic/fr/home/humanarzneimittel/marktueberwachung/health-professional-communication--hpc-.html';
Counter = 0;
/*
 */
/*
  ===
*/
Swiss = {}
/*
  Basic App Actions
*/
Swiss.patch = (data, type, lang) => {
    _.each(data, (item) => {
        let isExist = Items.findOne({
            title: item.title
        })
        let exclude = ["KPA Breakout Session – Präsentationen", "Newsdienste – Newsletter abonnieren",'"KPA Breakout Session – Présentations']
        if (!isExist || exclude.indexOf(item.title) == -1) {
            item.type = type;
            item.lang = lang;
            item.url = rootURL + item.url;
            var id = Items.insert(item);
            Swiss.scrapDrug(item.url, id)
        }
    })
}
/* 
  Write file to Disk
  => ('/export/FILENAME',data)
*/
Swiss.writeFile = (file, data) => {
    fs.writeFile(path + file, data, 'utf8', (err) => {
        if (err) console.log(err);
        console.log("Successfully Written to File./", file);
    });
}
/* 
  Get Exported Files
  => [file1,file2]
*/
Swiss.getFiles = (dir) => {
    if (!dir) return;
    return fs.readdirSync(path + dir)
}
/*
  getItems
    - Fetch collection with certain values
*/
Swiss.getItems = (type, lang) => {
    return Items.find({
        lang: lang,
        type: type
    },{sort:{dateOrder: -1}}).fetch()
}


console.log("DEBUG",Items.find({
    lang: 'de',
    type: 'doc'
}).count())


/*
  Custom Single Link Scrapper 
    - Puppeteer is NOT required
*/

//  #content > div > div.col-md-8.main-content.js-glossary-context > div.mod.mod-teaserlist > div.mod.mod-dynamic.done > div:nth-child(11) > div > div > p
Swiss.scrapDrug = (url, id) => {
    scrapeIt(url, {
        title: ".mod h1",
        date: '.mod-headline h5',
        date2: '.mod-teaser .teaserDate',
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
        
        
        if(data.title == 'KPA Breakout Session – Präsentationen' || data.title == 'KPA Breakout Session – Présentations'){
            console.log('Data Review...')
            Items.remove(id)
        }else{
            console.log('Files updated for ',data.title)
            data.pdf = rootURL + data.pdf
           


            // console.log({data})
            console.log('date: ',data.date, data.date2)

            Items.update({
                _id: id
            }, {
                $set: data
            })

            // console.log("ITEM CHECK:",Items.findOne({ _id: id}))
        }
        //console.log(`Scrapping status: ${response.statusCode}`)
       
    })
}
/*
  Runner
*/
// 
Swiss.record = () => {
    console.log('Progress: Getting files ready')
    Meteor.setTimeout(function () {
        Swiss.writeFile('exports/chargenrueckrufe_de.json', JSON.stringify(Swiss.getItems('drug', 'de')))
        Swiss.writeFile('exports/dhcp_hcp_de.json', JSON.stringify(Swiss.getItems('doc', 'de')))
        // French
        Swiss.writeFile('exports/chargenrueckrufe_fr.json', JSON.stringify(Swiss.getItems('drug', 'fr')))
        Swiss.writeFile('exports/dhcp_hcp_fr.json', JSON.stringify(Swiss.getItems('doc', 'fr')))
        console.log('Done: Files have been saved to /public/exports')
        Swiss.close()
    }, 5000)
}
/*
meteor | sed -e '/Exited with code/q'
*/
Swiss.close = async function () {
    console.log('Meteor Exit code.')
    process.exit(0)
    process.kill(process.pid)
}


Swiss.run = async () => {
    for (var i = 0; i <= Project.urls.length; i++) {

        var projects = Project.urls
        var project = projects[i]      
        if (!project || i == Project.urls.length) {
            // Close Meteor
            await Swiss.close()
            return
        }
        console.log('Project:START', project.file, '---')
        await scrapper(project.url, project.type, project.lang, project.file)
    }

}


/*
  Pupeeter Scrapper
*/
// old 
let scrapper = async (url, type, lang, file) => {
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
    // Await Data elements to be loaded
    await page.waitForSelector(".mod-teaser")


    const nav = await page.evaluate(() => {
        var nav = document.querySelectorAll('a[data-loadpage]')
        var nav = [].map.call(nav, a => a.getAttribute("data-loadpage"));
        var nav = nav.filter(function (e) {
            return e !== 0
        })
        var nav = nav.filter((x, i, a) => a.indexOf(x) == i)
        return nav;
    })


    // nav.unshift('1')

    console.log('Pages =>', nav)
    if (!nav.length) {
        log('error', 'Checking; There is no navigation')
        return
    }




    //
    for (var i = 0; i <= nav.length; i++) {
        console.log("PAGE: ",i)

        if (i == nav.length) {
            console.log('Project:FINISHED', file, 'DONE')
            console.log('----------------------------------')
            Swiss.writeFile('exports/' + file, JSON.stringify(Swiss.getItems(type, lang)))
            console.log('Check', file , " : " ,Items.find({type:type, lang:lang}).count() )
            console.log('----------------------------------')
            
            break;
        }


        const dimensions = await page.evaluate(() => {
            var nav = document.querySelectorAll('a[data-loadpage]')
            var content = document.querySelectorAll('.mod-teaser')
            var title = document.querySelectorAll('.mod-teaser a')
            var items = []
            
            var nav = [].map.call(nav, a => a.getAttribute("data-loadpage"));
            var nav = nav.filter(function (e) {
                return e !== 0
            })
            var nav = nav.filter((x, i, a) => a.indexOf(x) == i)


            for (var i = 0; i < content.length; i++) {
                var item = {
                    title: title[i].innerHTML,
                    url: title[i].getAttribute('href')
                }

                var date = content[i].innerHTML

                var date = date.replace(/<[^>]*>?/gm, '')
                var date = date.replace(/^\s+|\s+$/g, '')
                var date = date.replace(/\n/g, '')
                var date = date.split(" ")
                var date = date[0]

                var dateArr = date.split(".")
                
                var date =  dateArr.join('/')
                
                item.dateOrder = dateArr.reverse().join('/')

                item.mainDate = date;



                console.log({item})
                var skip = ['Newsdienste', 'Services']
                if (skip.indexOf(date) == -1) {
                    items.push(item)
                }
            }

            return {
                items: items,
                nav: nav,
            };
        });



        if (dimensions.items && dimensions.items.length) {
            Swiss.patch(dimensions.items, type, lang)
            console.log('Data Patch set:' , dimensions.items.length)
        }

        // if (i !== 1) {
        await page.click('a[data-loadpage = "' + nav[i] + '"]');
        console.log(' PAGE >', nav[i] , 'of' , nav)
        await page.waitFor(3000);
        // }

    }

    await browser.close();
    console.log("Project",file, ' is done');
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
/*
 */


let isSwiss = Meteor.settings.isSwiss
if (isSwiss) {
    log('start', 'SwissMedic.ch Scrapping init')
    Swiss.run()
}