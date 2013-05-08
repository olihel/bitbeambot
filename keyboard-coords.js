/*!
 * keyboard-coords
 * https://github.com/olihel/bitbeambot.git
 *
 * Copyright (c) 2013 Oliver Hellebusch
 * Released under MIT license
 *
 * based on bitbeambot, https://github.com/hugs/bitbeambot
 * Copyright 2012
 * Chris Williams, Jason Huggins
 * MIT License
 */

(function () {
  var five = require('johnny-five');
  var ik = require('./ik');
  var keypress = require('keypress');

  var board = new five.Board({ debug: false});
  var axes = [0, 0, -100];

  board.on('ready', function() {
    var servo1 = five.Servo({pin: 9});
    var servo2 = five.Servo({pin: 10});
    var servo3 = five.Servo({pin: 11});
    var servos = five.Servos();

    board.repl.inject({
      servo1: servo1, s1: servo1,
      servo2: servo2, s2: servo2,
      servo3: servo3, s3: servo3,
      servos: servos
    });

    servo1.on('error', function () { console.log(arguments); });
    servo2.on('error', function () { console.log(arguments); });
    servo3.on('error', function () { console.log(arguments); });

    var updatePosition = function () {
      var angles = ik.inverse(axes[0], axes[1], axes[2]);
      servo1.move(angles[1]);
      servo2.move(angles[2]);
      servo3.move(angles[3]);
      console.log('x:', axes[0], 'y:', axes[1], 'z:', axes[2]);
    };

    updatePosition();

    (function () {
      keypress(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      console.log('\n### control x/y axes:   up/down/left/right keys');
      console.log('### control z axis:     q/a keys');
      console.log('### exit:               esc key');

      process.stdin.on('keypress', function (chunk, key) {
        if (key) {
          if (key.name === 'escape') {
            process.exit();
          }
          if (key.name === 'left') {
            --axes[0];
            updatePosition();
            return;
          }
          if (key.name === 'right') {
            ++axes[0];
            updatePosition();
            return;
          }
          if (key.name === 'up') {
            ++axes[1];
            updatePosition();
            return;
          }
          if (key.name === 'down') {
            --axes[1];
            updatePosition();
            return;
          }
          if (key.name === 'q') {
            --axes[2];
            updatePosition();
            return;
          }
          if (key.name === 'a') {
            ++axes[2];
            updatePosition();
            return;
          }
        }
      });
    }());
  });
}());
