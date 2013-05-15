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

  var playback = function () {
    var pos = recorded.shift();

    bot.moveTo(pos.x, pos.y, pos.z);

    if (!recorded.length) {
      clearInterval(playbackIntervalID);
      bot.moveToOrigin();
      setTimeout(function () {
        console.log('playback finished');
        process.exit();
      }, 500);
    } else {
      playbackIntervalID = setTimeout(playback, recorded[0].delay || 40);
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
      playbackIntervalID = setTimeout(playback, recorded[0].delay || 40);
    }
  });
}());
