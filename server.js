require('dotenv').config()
var express = require('express');
var request = require('request');
var async = require('async');

var app = express();
var port = process.env.PORT || 3000;

var clientId = process.env.CLIENT_ID;
var clientSecret = process.env.CLIENT_SECRET;

app.use(express.static('public'));
app.set('view engine', 'ejs');

var secretString = new Buffer(`${clientId}:${clientSecret}`).toString('base64');
var seedArtistId = '4dpARuHxo51G3z768sgnrY';
var accessToken;
var authOptions = {
  url: 'https://accounts.spotify.com/api/token',
  headers: {
    'Authorization': `Basic ${secretString}`
  },
  form: {
    grant_type: 'client_credentials'
  },
  json: true
};

// get Spotify access token
request.post(authOptions, (error, response, body) => {
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    accessToken = body.access_token;
  }
});

app.get('/', (req, res) => {
  var state = {};
  var endpoints = {
    artist: `https://api.spotify.com/v1/artists/${seedArtistId}`,
    related: `https://api.spotify.com/v1/artists/${seedArtistId}/related-artists`,
    topTracks: `https://api.spotify.com/v1/artists/${seedArtistId}/top-tracks?country=US`
  };
  var options = {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    json: true
  };
  var getApiObject = (callback, requestOptions, urlKey) => {
    Object.assign(requestOptions, { url: endpoints[urlKey] });
    request.get(requestOptions, (err, response, body) => {
      callback(null, body);
    });
  }

  async.parallel({
    artist: (callback) => {
      getApiObject(callback, options, 'artist');
    },
    related: (callback) => {
      getApiObject(callback, options, 'related');
    },
    topTracks: (callback) => {
      getApiObject(callback, options, 'topTracks');
    }
  }, (err, results) => {
    var initialState = `window.__INITIAL_STATE__ = ${ JSON.stringify(results) }`
    res.render('index', { initialState });
  });

});


app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});