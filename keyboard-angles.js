/*!
 * keyboard-angles
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
  var ANGLE_INIT = 35;

  var five = require('johnny-five');
  var keypress = require('keypress');

  var board = new five.Board({ debug: false});
  var angles = [ANGLE_INIT, ANGLE_INIT, ANGLE_INIT];
  var currentAngle = 0;

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
      servo1.move(angles[0]);
      servo2.move(angles[1]);
      servo3.move(angles[2]);
    };

    updatePosition();

    (function () {
      keypress(process.stdin);
      process.stdin.setRawMode(true);
      process.stdin.resume();

      console.log('\n### control angles:                left/right keys');
      console.log('### select servo:                  1/2/3 keys');
      console.log('### exit and show current angles:  esc key');

      process.stdin.on('keypress', function (chunk, key) {
        if (key) {
          if (key.name === 'escape') {
            console.log('angles: ', angles);
            process.exit();
          }
          if (key.name === 'left') {
            --angles[currentAngle];
            updatePosition();
            return;
          }
          if (key.name === 'right') {
            ++angles[currentAngle];
            updatePosition();
            return;
          }
        } else {
          if (chunk == '1') {
            console.log('\nservo: 1');
            currentAngle = 0;
          } else if (chunk == '2') {
            console.log('\nservo: 2');
            currentAngle = 1;
          } else if (chunk == '3') {
            console.log('\nservo: 3');
            currentAngle = 2;
          }
        }
      });
    }());
  });
}());
