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
    var pos;

    bot.updatePosition();

    if (!recorded.length) {
      console.log('playback finished');
      clearInterval(playbackIntervalID);
      return;
    }

    pos = recorded.shift();
    bot.axes[0] = pos.x;
    bot.axes[1] = pos.y;
    bot.axes[2] = pos.z;

    playbackIntervalID = setTimeout(playback, pos.delay || 40);
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
          }, 1500);
        }
      }
    });

    recorded = JSON.parse(fs.readFileSync(RECORD_OUTPUT));
    recorded.length && playback();
  });
}());
