(function() {
  var state = window.__INITIAL_STATE__,
      request = window.request;

  var App = {
    renderArtistBlock: function(artist) {
      var artistName = artist.name,
          imgSrc = artist.images[0].url,
          totalFollowers = artist.followers.total,
          spotifyLink = artist.external_urls.spotify,
          artistBlockNode = document.querySelector('.artist-block'),
          artistNameNode = document.createElement('h2'),
          imageNode = document.createElement('img'),
          followersNode = document.createElement('span'),
          spotifyLinkNode = document.createElement('a')

      artistNameNode.className += ' artist-full-name';
      artistNameNode.innerText = artistName;
      artistBlockNode.appendChild(artistNameNode);

      imageNode.className += ' artist-image';
      imageNode.src = imgSrc;
      imageNode.alt = this._joinImgAltString(artistName, 'image');
      artistBlockNode.appendChild(imageNode);

      followersNode.className += ' artist-followers';
      followersNode.innerText = totalFollowers;
      artistBlockNode.appendChild(followersNode);

      spotifyLinkNode.className += ' artist-spotify-link';
      spotifyLinkNode.target = '_blank';
      spotifyLinkNode.innerText = 'Open in Spotify';
      spotifyLinkNode.href = spotifyLink;
      artistBlockNode.appendChild(spotifyLinkNode);
    },

    renderRelatedBlock: function(related) {
      var relatedArtistsBlockNode = document.querySelector('.related-artists-block'),
          relatedListNode = document.createElement('ul'),
          relatedArtists = related.artists;

      for (var i = 0; i < relatedArtists.length; i++) {
        var artist = relatedArtists[i],
            artistId = artist.id,
            artistName = artist.name,
            thumbnailSrc = artist.images[2].url,
            spotifyLink = artist.external_urls.spotify,
            relatedNode = document.createElement('li'),
            artistNode = document.createElement('a'),
            nameNode = document.createElement('span'),
            thumbnailNode = document.createElement('img'),
            spotifyLinkNode = document.createElement('a');

        relatedNode.className += ' related-artist';

        nameNode.className += ' related-artist-name';
        nameNode.innerText = artistName;

        thumbnailNode.className += ' related-artist-thumbnail';
        thumbnailNode.alt = this._joinImgAltString(artistName, 'thumbnail');
        thumbnailNode.src = thumbnailSrc;

        spotifyLinkNode.className += ' artist-spotify-link';
        spotifyLinkNode.target = '_blank';
        spotifyLinkNode.innerText = 'Open in Spotify';
        spotifyLinkNode.href = spotifyLink;

        artistNode.className += ' related-artist-link';
        artistNode.href = '/artist/' + artistId;
        artistNode.style.display = 'block';
        artistNode.appendChild(thumbnailNode);
        artistNode.appendChild(nameNode);
        artistNode.addEventListener('click', this._switchArtist.bind(this));

        relatedNode.appendChild(artistNode);
        relatedNode.appendChild(spotifyLinkNode);
        relatedListNode.appendChild(relatedNode);
      }

      relatedArtistsBlockNode.appendChild(relatedListNode);
    },

    renderTopTracksBlock: function(topTracks) {
      var topTracksBlockNode = document.querySelector('.top-tracks-block'),
          topTracksNode = document.createElement('ul'),
          tracks = topTracks.tracks;

      for (var i = 0; i < tracks.length; i++) {
        var track = tracks[i],
            trackName = track.name,
            previewUrl = track.preview_url,
            trackNode = document.createElement('li'),
            trackNameNode = document.createElement('span'),
            previewNode = document.createElement('audio'),
            srcNode = document.createElement('source');

        trackNameNode.className += ' track-name';
        trackNameNode.innerText = trackName;

        srcNode.className += ' preview-source';
        srcNode.type = 'audio/mpeg';
        srcNode.src = previewUrl;

        previewNode.setAttribute('controls', true);
        previewNode.appendChild(srcNode);

        trackNode.appendChild(trackNameNode);
        trackNode.appendChild(previewNode);
        topTracksNode.appendChild(trackNode);
      }

      topTracksBlockNode.appendChild(topTracksNode);
    },

    render: function(state) {
      var artist = state.artist,
          related = state.related,
          topTracks = state.topTracks;

      this.renderArtistBlock(artist);
      this.renderRelatedBlock(related);
      this.renderTopTracksBlock(topTracks);
    },

    _joinImgAltString: function(artistName, altName) {
      return artistName.replace(/\s/g, '-').toLowerCase() + '-' + altName;
    },

    _switchArtist(event) {
      event.preventDefault();
      var target = this._findTargetAnchor(event);
      request.get(target.href, function(response) {
        var state = JSON.parse(response);
        console.log(state);
      });
    },

    _findTargetAnchor(event) {
      return event.target.nodeName === 'A' ? event.target : event.target.parentElement;
    }
  }

  App.render(state);
})()