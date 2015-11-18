'use strict';

var fs = require('fs');
var path = require('path');
var config = {};

try {
  fs.accessSync(path.join(__dirname, 'config.json'), fs.R_OK);
  config = require('./config.json');
} catch(e){
  return console.error(`Cannot read config.json in ${__dirname}`);
}

var tweet = require('./tweet')(config);
var feed = require('./feed')(config);
var prev = new Date(config.latest || Date.now());

feed.get()
  .then( feeds => {
    var latest = new Date(config.latest);

    feeds = feeds.filter( item => item.pubdate > latest );
    feeds.reverse();

    return feeds.reduce(
      (cur, item) => tweet.post(item.title + '\n' + item.link).then( () => Promise.resolve(config.latest = item.pubdate)  ),
      Promise.resolve(true)
    );
  })
  .catch( error => {
    console.error(error);
  })
  .then( () => {
    if (config.latest > prev) {
      fs.writeFileSync(path.resolve('./config.json'), JSON.stringify(config));
    }
  });
