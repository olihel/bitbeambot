/*!
 * playback.js
 * https://github.com/olihel/bitbeambot.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license
 */

(function () {
  var RECORD_OUTPUT = 'recorded.json';

  var bot = require('./bitbeambot');
  var fs = require('fs');
  var keypress = require('keypress');

  var recorded = [];
  var playbackIntervalID = null;

  var config = {};
  var parampattern = /^--([^=]+)=(.+)$/;
  process.argv.slice(2).forEach(function(param) {
    var matcher = param.match(parampattern);
    if (matcher.length) {
      config[matcher[1]] = matcher[2];
    }
  });

  var playback = function (c) {
    var pos = recorded[c];

    if (pos) {
      pos.comment && console.log('next: ' + pos.comment);

      if (pos.delay < bot.config.tween.duration) {
        bot.axes[0] = pos.x;
        bot.axes[1] = pos.y;
        bot.axes[2] = pos.z;
        bot.updatePosition();
      } else {
        bot.moveTo(pos.x, pos.y, pos.z);
      }

      playbackIntervalID = setTimeout(playback, recorded[c + 1] && recorded[c + 1].delay || 40, ++c);
    } else {
      clearInterval(playbackIntervalID);
      bot.moveToOrigin();
      setTimeout(function () {
        console.log('playback finished');
        config.loop ? (playbackIntervalID = setTimeout(playback, recorded[0].delay || 40, 0)) : process.exit();
      }, 500);
    }
  };

  bot.initialize(function () {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    process.stdin.on('keypress', function (chunk, key) {
      if (key) {
        if (key.name === 'escape') {
          playbackIntervalID && clearInterval(playbackIntervalID);
          bot.moveToOrigin();
          setTimeout(function () {
            process.exit();
          }, 500);
        }
      }
    });

    recorded = JSON.parse(fs.readFileSync(RECORD_OUTPUT));
    if (recorded.length) {
      playbackIntervalID = setTimeout(playback, recorded[0].delay || 40, 0);
    }
  });
}());
