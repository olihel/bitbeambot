/*!
 * keyboard-coords
 * https://github.com/olihel/bitbeambot.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license
 */

(function () {
  var bot = require('./bitbeambot');
  var fs = require('fs');
  var keypress = require('keypress');

  var RECORD_INTERVAL = 50;
  var RECORD_OUTPUT = 'recorded.json';

  var recordIntervalID = null;
  var recorded = [];

  var recordPosition = function (delay) {
    recorded.push({
      x: bot.axes[0],
      y: bot.axes[1],
      z: bot.axes[2],
      delay: delay
    });
  };

  bot.initialize(function () {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    console.log('\n### control x/y axes:   up/down/left/right keys');
    console.log('### control z axis:     q/a keys');
    console.log('### start recording:    r key');
    console.log('### record current pos: space key');
    console.log('### exit:               esc key');

    process.stdin.on('keypress', function (chunk, key) {
      if (key) {
        if (key.name === 'escape') {
          if (recorded.length) {
            recordIntervalID && clearInterval(recordIntervalID);
            fs.writeFileSync(RECORD_OUTPUT, JSON.stringify(recorded));
            console.log('recorded movement saved to ' + RECORD_OUTPUT);
          }
          process.exit();
        }
        if (key.name === 'r') {
          console.log('start recording');
          recordIntervalID = setInterval(recordPosition, RECORD_INTERVAL, [RECORD_INTERVAL]);
        } else if (key.name === 'space') {
          console.log('record position ' + bot.axes);
          recordPosition(1000);
        } else if (key.name === 'left') {
          --bot.axes[0];
          bot.updatePosition();
        } else if (key.name === 'right') {
          ++bot.axes[0];
          bot.updatePosition();
        } if (key.name === 'up') {
          ++bot.axes[1];
          bot.updatePosition();
        } if (key.name === 'down') {
          --bot.axes[1];
          bot.updatePosition();
        } if (key.name === 'q') {
          ++bot.axes[2];
          bot.updatePosition();
        } if (key.name === 'a') {
          --bot.axes[2];
          bot.updatePosition();
        }
      }
    });

    bot.updatePosition();
  });
}());
