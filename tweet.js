'use strict';

var Twitter = require('twitter');

module.exports = function(config) {
  var twitter = new Twitter({
    consumer_key: config.consumerKey,
    consumer_secret: config.consumerSecret,
    access_token_key: config.accessToken,
    access_token_secret: config.accessTokenSecret
  });

  return {
    getLatest() {
      return new Promise( (resolve, reject) => {
        twitter.get(
          'statuses/user_timeline',
          {count:1, trim_user:true, exclude_replies:true, include_rts:false},
          function(err, tweets, response){
            if (!err && tweets.length > 0) {
              var latest = Object.assign({}, tweets[0]);
              latest.created_at = new Date(latest.created_at);
              resolve(latest);
            }
          }
        );
      });
    },
    
    post(status) {
      return new Promise( (resolve, reject) => {
	twitter.post('statuses/update', { status }, (error, tweet, response) => {
	  if (error) return reject(error);
	  resolve(tweet);
	});
      });
    }
  };
};
