'use strict';

var FeedParser = require('feedparser');
var request = require('request');

module.exports = function(config) {
  if (!config.feedUrl) {
    throw `Cannot find feedUrl in configuration`;
  }

  return {
    // read the feed
    get() {
      return new Promise(function(resolve, reject){
        var parser = new FeedParser(), feeds = [];

        request(config.feedUrl)
          .on('response', function(res){
            var stream = this;
            if (res.statusCode != 200) return this.emit('error', new Error('Bad status code'));
            stream.pipe(parser);
          })
          .on('error', function(error){
            reject(error);
          });

        parser
          .on('readable', function(){
            var stream = this, item;
            while(item = stream.read()) {
              feeds.push({
                title: item.title,
                link: item.link,
                pubdate: item.pubdate
              });
            }
          })
          .on('end', function(){
            resolve(feeds);
          })
          .on('error', function(error){
            reject(error);
          });
      });
    }
  };
};
