require('dotenv').config()
var express = require('express');
var request = require('request');

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
request.post(authOptions, function(error, response, body) {
  if (!error && response.statusCode === 200) {
    // use the access token to access the Spotify Web API
    accessToken = body.access_token;
  }
});

app.get('/', (req, res) => {
  var options = {
    url: `https://api.spotify.com/v1/artists/${seedArtistId}`,
    headers: {
      'Authorization': `Bearer ${accessToken}`
    },
    json: true
  };

  request.get(options, function(error, response, body) {
    var initialState = `window.__INITIAL_STATE__ = ${ JSON.stringify(body) }`
    res.render('index', { initialState });
  });
});


app.listen(port, () => {
  console.log(`App listening on port ${port}!`);
});