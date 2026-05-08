/* embed.js — MathLab Education | YouTube embed & thumbnail helpers */
(function () {
  'use strict';

  ML.embed = {

    /* ── Replace thumbnail placeholder with live iframe ── */
    loadVideo: function (cardId, ytId) {
      var card = document.getElementById(cardId);
      if (!card) return;

      var thumb = card.querySelector('.video-thumb');
      if (!thumb) return;

      /* Build iframe */
      var iframe = document.createElement('iframe');
      iframe.src = 'https://www.youtube.com/embed/' + ytId
        + '?autoplay=1&rel=0&modestbranding=1';
      iframe.allow = 'accelerometer; autoplay; clipboard-write; '
        + 'encrypted-media; gyroscope; picture-in-picture';
      iframe.allowFullscreen = true;
      iframe.title = card.querySelector('.video-title')
        ? card.querySelector('.video-title').textContent : 'Video';

      /* Swap thumb → iframe */
      thumb.parentNode.replaceChild(iframe, thumb);
      card.classList.add('playing');
    },

    /* ── Attach click listeners to every .video-card ── */
    initVideoThumbs: function () {
      var cards = document.querySelectorAll('.video-card[data-yt-id]');
      cards.forEach(function (card) {
        var ytId  = card.dataset.ytId;
        var cardId = card.id;
        if (!ytId || !cardId) return;

        /* Ensure thumb wrapper exists */
        var thumb = card.querySelector('.video-thumb');
        if (!thumb) return;

        /* Lazy-load thumbnail image */
        var img = thumb.querySelector('img.thumb-img');
        if (img && !img.src) {
          img.src = 'https://img.youtube.com/vi/' + ytId + '/hqdefault.jpg';
          img.onerror = function () {
            img.src = 'https://img.youtube.com/vi/' + ytId + '/mqdefault.jpg';
          };
        }

        /* Play button click */
        thumb.addEventListener('click', function () {
          ML.embed.loadVideo(cardId, ytId);
        });

        /* Keyboard accessibility */
        thumb.setAttribute('tabindex', '0');
        thumb.setAttribute('role', 'button');
        thumb.setAttribute('aria-label', 'Play video');
        thumb.addEventListener('keydown', function (e) {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            ML.embed.loadVideo(cardId, ytId);
          }
        });
      });
    },

    /* ── Re-init after admin re-renders the video section ── */
    refresh: function () {
      ML.embed.initVideoThumbs();
    }
  };

  /* Auto-init once DOM is ready */
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', ML.embed.initVideoThumbs);
  } else {
    ML.embed.initVideoThumbs();
  }

})();
