require('dotenv').config();

const express = require('express');
const hbs = require('hbs');
const SpotifyWebApi = require('spotify-web-api-node');

const app = express();

app.set('view engine', 'hbs');
app.set('views', __dirname + '/views');
app.use(express.static(__dirname + '/public'));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.CLIENT_ID,
  clientSecret: process.env.CLIENT_SECRET
});

// Retrieve an access token
spotifyApi
  .clientCredentialsGrant()
  .then(data => spotifyApi.setAccessToken(data.body['access_token']))
  .catch(error =>
    console.log('Something went wrong when retrieving an access token', error)
  );

// Our routes go here:

app.get('/', (req, res) => {
  res.render('home');
});

app.get('/artist-search', (req, res) => {
  const term = req.query.term;

  spotifyApi
    .searchArtists(term)
    .then(data => {
      console.log('The received data from the API: ', data.body);
      // ----> 'HERE WHAT WE WANT TO DO AFTER RECEIVING THE DATA FROM THE API'
      const artists = data.body.artists.items;
      console.log(artists);

      res.render('artist-search-results', { artists: artists, name: term });
    })
    .catch(err =>
      console.log('The error while searching artists occurred: ', err)
    );
});

app.get('/albums/:artistId', (req, res, next) => {
  const paramsArr = req.params.artistId.split('_');
  const artistId = paramsArr[0];
  const artistName = paramsArr[1];
  spotifyApi
    .getArtistAlbums(artistId)
    .then(data => {
      res.render('albums', {
        albums: data.body.items,
        name: artistName
      });
    })
    .catch(error => {
      console.log(
        `An error while searching for the album has occured: `,
        error
      );
    });
});

app.get('/tracks/:albumId', (req, res) => {
  const paramsArr = req.params.albumId.split('_');
  const albumId = paramsArr[0];
  const albumName = paramsArr[1];

  spotifyApi
    .getAlbumTracks(albumId)
    .then(data => {
      res.render('tracks', {
        tracks: data.body.items,
        name: albumName
      });
    })
    .catch(error => {
      console.log(
        `An error while searching for the album has occured: `,
        error
      );
    });
});

app.listen(3000, () =>
  console.log('My Spotify project running on port 3000 🎧 🥁 🎸 🔊')
);
