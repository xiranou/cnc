(function() {
  var state = window.__INITIAL_STATE__,
      request = window.request;

  var App = App || {
    renderArtistBlock: function(artist) {
      var artistName = artist.name,
          imgSrc = artist.images[0].url,
          totalFollowers = artist.followers.total,
          spotifyLink = artist.external_urls.spotify,
          artistBlockNode = document.querySelector('.artist-block'),
          artistNameNode = this._createElement('h2'),
          imageNode = this._createElement('img'),
          followersNode = this._createElement('span'),
          spotifyLinkNode = this._createElement('a')

      artistNameNode.className += ' artist-full-name';
      artistNameNode.innerText = artistName;

      imageNode.className += ' artist-image';
      imageNode.src = imgSrc;
      imageNode.alt = this._joinImgAltString(artistName, 'image');

      followersNode.className += ' artist-followers';
      followersNode.innerText = totalFollowers + ' followers';

      spotifyLinkNode.className += ' rect-button spotify-link';
      spotifyLinkNode.target = '_blank';
      spotifyLinkNode.innerText = 'Open in Spotify';
      spotifyLinkNode.href = spotifyLink;

      artistBlockNode.appendChild(imageNode);
      artistBlockNode.appendChild(artistNameNode);
      artistBlockNode.appendChild(followersNode);
      artistBlockNode.appendChild(spotifyLinkNode);
    },

    renderRelatedBlock: function(related) {
      var relatedArtistsBlockNode = document.querySelector('.related-artists-block'),
          relatedListNode = this._createElement('ul'),
          relatedArtists = related.artists;

      relatedListNode.className += ' related-artists-list';

      if ( relatedArtists.length > 0 ) {
        for (var i = 0; i < relatedArtists.length; i++) {
          var artist = relatedArtists[i],
              artistId = artist.id,
              artistName = artist.name,
              thumbnailSrc = artist.images[artist.images.length-1].url,
              relatedNode = this._createElement('li'),
              nameNode = this._createElement('span'),
              thumbnailNode = this._createElement('img'),
              seeButtonNode = this._createElement('a');

          relatedNode.className += ' related-artist';

          nameNode.className += ' related-artist-name';
          nameNode.innerText = artistName;

          thumbnailNode.className += ' related-artist-thumbnail';
          thumbnailNode.alt = this._joinImgAltString(artistName, 'thumbnail');
          thumbnailNode.src = thumbnailSrc;

          seeButtonNode.className += ' rect-button see-artist';
          seeButtonNode.innerText = 'See Artist';
          seeButtonNode.href = '/artist/' + artistId
          seeButtonNode.addEventListener('click', this._switchArtist.bind(this));

          relatedNode.appendChild(thumbnailNode);
          relatedNode.appendChild(nameNode);
          relatedNode.appendChild(seeButtonNode);
          relatedListNode.appendChild(relatedNode);
        }
      } else {
        var relatedNode = this._createElement('li'),
            messageNode = this._createMessageNode('Sorry, no related artists found.', 'no-found-message');

        relatedNode.appendChild(messageNode);
        relatedListNode.appendChild(relatedNode);
      }

      relatedArtistsBlockNode.appendChild(relatedListNode);
    },

    renderTopTracksBlock: function(topTracks) {
      var topTracksBlockNode = document.querySelector('.top-tracks-block'),
          topTracksNode = this._createElement('ul'),
          tracks = topTracks.tracks;

      topTracksNode.className += ' top-tracks-list';

      if (tracks.length > 1) {
        for (var i = 0; i < tracks.length; i++) {
          var track = tracks[i],
              trackName = track.name,
              previewUrl = track.preview_url,
              trackNode = this._createElement('li'),
              trackNameNode = this._createElement('span'),
              playButtonNode = this._createElement('a');

          trackNameNode.className += ' track-name';
          trackNameNode.innerText = trackName;

          playButtonNode.className += ' rect-button play-preview';
          playButtonNode.innerText = 'Play';
          playButtonNode.href = previewUrl;


          playButtonNode.addEventListener('click', this._appendPreviewIframe.bind(this));

          trackNode.appendChild(trackNameNode);
          trackNode.appendChild(playButtonNode);
          topTracksNode.appendChild(trackNode);
        }
      } else {
        var trackNode = this._createElement('li'),
            messageNode = this._createMessageNode('Sorry, no related tracks found.', 'no-found-message');

        trackNode.appendChild(messageNode);
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

    _switchArtist: function(event) {
      event.preventDefault();

      request.get(event.target.href, function(response) {
        state = JSON.parse(response);
        this._resetParentNodes();
        window.scrollTo(0, 0);
        this.render(state);
      }.bind(this));
    },

    _appendPreviewIframe: function(event) {
      event.preventDefault();
      var target = event.target,
          previewIframes = Array.prototype.slice.call(document.querySelectorAll('.song-preview'), 0);

      for (var i = 0; i < previewIframes.length; i++) {
        var preview = previewIframes[i];

        // reset play button text
        preview.previousSibling.innerText = 'Play';
        preview.parentNode.removeChild(preview);
      }

      if (target.dataset.hidePreview) {
        target.innerText = 'Play';
        target.removeAttribute('data-hide-preview');
      } else {
        var iframe = this._createElement('iframe');

        target.innerText = 'Hide';
        target.dataset.hidePreview = true;

        iframe.className += ' song-preview';
        iframe.src = target.href;
        iframe.setAttribute('frameborder', '0');
        iframe.setAttribute('type', 'audio/mpeg');

        target.parentNode.appendChild(iframe);
      }

    },

    _createElement: function(nodeType) {
      var node = document.createElement(nodeType);

      node.dataset.dynamic = true;
      return node;
    },

    _createMessageNode: function(message, classes) {
      var messageNode = this._createElement('p'),
          className = ' ' + classes;

      messageNode.className += className;
      messageNode.innerText = message;

      return messageNode;
    },

    _resetParentNodes: function() {
      var parentBlockNodes = document.querySelectorAll('.parent-block');
      for (var i = 0; i < parentBlockNodes.length; i++) {
        var parentNode = parentBlockNodes[i],
            childNodes = Array.prototype.slice.call(parentNode.children, 0); // turn collection into array

        for (var j = 0; j < childNodes.length; j++) {
          var child = childNodes[j];
          if (child.dataset.dynamic) { parentNode.removeChild(child); }
        }
      }
    }
  }

  App.render(state);
})()