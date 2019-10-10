# Parsing Swissmedic and Pharmnet with Meteor

#### Install Meteor on Linux
`curl https://install.meteor.com/ | sh`

#### Install dependencies
$ meteor npm install

#### Run the Software
$ meteor --once --settings pharma.json

$ meteor --once --settings swiss.json

 __in progress__

$ meteor --once --settings atc.json   

#### Check files
$ cd public/exports

#### Check files in Browser
Open http://localhost:3000 in the browser

#### Debugging
$ METEOR_PROFILE=1 METEOR_LOG=debug meteor --verbose

#### Configure:



### Missing ATC-Code

./atc.json

set "loadMissing":true
set "Missing" => Missing code in array