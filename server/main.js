import {
  Meteor
} from 'meteor/meteor';
import log from './log.js'
import './swissmedic.js'
import './pharma.js'


if(!Meteor.settings.isPharma || Meteor.settings.isSwiss){
  log('error','Please specificy setting file:')
  log('warning','$meteor  --setting pharma.json')
  log('warning','$meteor  --setting swiss.json')
}