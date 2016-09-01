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

var getArtistData = (artistId, callback) => {
  var state = {};
  var endpoints = {
    artist: `https://api.spotify.com/v1/artists/${artistId}`,
    related: `https://api.spotify.com/v1/artists/${artistId}/related-artists`,
    topTracks: `https://api.spotify.com/v1/artists/${artistId}/top-tracks?country=US`
  };
  var options = {
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    json: true
  };
  var _getApiObject = (requestOptions, urlKey, parallelCallback) => {
    Object.assign(requestOptions, { url: endpoints[urlKey] });
    request.get(requestOptions, (err, response, body) => {
      parallelCallback(null, body);
    });
  }

  async.parallel({
    artist: (parallelCallback) => {
      _getApiObject(options, 'artist', parallelCallback);
    },
    related: (parallelCallback) => {
      _getApiObject(options, 'related', parallelCallback);
    },
    topTracks: (parallelCallback) => {
      _getApiObject(options, 'topTracks', parallelCallback);
    }
  }, (err, results) => {
    callback(results);
  });
}

app.get('/', (req, res) => {
  getArtistData(seedArtistId, (results) => {
    var initialState = `window.__INITIAL_STATE__ = ${ JSON.stringify(results) }`
    res.render('index', { initialState });
  });
});

app.get('/artist/:id', (req, res) => {
  getArtistData(req.params.id, (results) => {
    res.send(JSON.stringify(results));
  });
})

app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});
