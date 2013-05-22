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
  var pauseStart;

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

  var pause = function(){
    var now = new Date().getTime();
    if(!pauseStart){ //start
      console.log('starting pause');
      pauseStart = now;
    }else{ //stop
      console.log('stopped pause');
      recordPosition(now - pauseStart);
      pauseStart = null;
    }
  }

  var popPosition = function () {
    return recorded.pop();
  };

  bot.initialize(function () {
    keypress(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.resume();

    console.log('\n### control x/y axes:         up/down/left/right keys');
    console.log('### control z axis:           q/a keys');
    console.log('### start recording:          r key');
    console.log('### record current pos:       space key');
    console.log('### start/end record pause    p key');
    console.log('### swipe left/right          l/k keys');
    console.log('### tap                       t key');
    console.log('### delete last recorded pos: backspace key');
    console.log('### exit:                     esc key');

    var handler = {
      "escape": function() {
        if (recorded.length) {
          recordIntervalID && clearInterval(recordIntervalID);
          fs.writeFileSync(RECORD_OUTPUT, JSON.stringify(recorded));
          console.log('recorded movement saved to ' + RECORD_OUTPUT);
        }
        bot.moveToOrigin();
        setTimeout(function () {
          process.exit();
        }, 1500);
      },
      "r": function() {
        console.log('start recording');
        recordIntervalID = setInterval(recordPosition, RECORD_INTERVAL, RECORD_INTERVAL);
      },
      "space": function() {
        console.log('record position ' + bot.axes);
        pauseStart && pause();
        recordPosition(1000);
      },
      "p": function(){
        pause();
      },
      "backspace": function() {
        var pos = popPosition();
        if (pos) {
          console.log('deleted position ' + [pos.x, pos.y, pos.z].join(", "));
        } else {
          console.log('no recorded position to delete');
        }
      },
      "__default__": function(keyName) {
        bot.moveRelative(keyName);
      }
    };

    process.stdin.on('keypress', function (chunk, key) {
      var keyName = key && key.name;
      if (keyName) {
        (handler[keyName] || handler["__default__"]).call(null, keyName);  
      }
    });
  });
}());
