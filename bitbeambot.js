/*!
 * bitbeambot.js
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

(function(exports){
  var CONFIG_FILE = 'bitbeambot-config.json';

  var fs = require('fs');
  var five = require('johnny-five');
  var ik = require('./ik');

  var config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE)) : {};
  var board = new five.Board(config.board || { debug: false});
  var servo1, servo2, servo3, servos;
  var axes = [0, 0, -100];  // x, y, z

  var initialize = function (readyHandler) {
    board.on('ready', function() {
      servo1 = five.Servo({pin: 9});
      servo2 = five.Servo({pin: 10});
      servo3 = five.Servo({pin: 11});
      servos = five.Servos();

      board.repl.inject({
        servo1: servo1, s1: servo1,
        servo2: servo2, s2: servo2,
        servo3: servo3, s3: servo3,
        servos: servos
      });

      servo1.on('error', function () { console.log(arguments); });
      servo2.on('error', function () { console.log(arguments); });
      servo3.on('error', function () { console.log(arguments); });

      readyHandler();
    });
  };

  var updatePosition = function () {
    var angles = ik.inverse(axes[0], axes[1], axes[2]);
    servo1.move(angles[1]);
    servo2.move(angles[2]);
    servo3.move(angles[3]);
    console.log('x:', axes[0], 'y:', axes[1], 'z:', axes[2]);
  };

  exports.config = config;
  exports.axes = axes;
  exports.initialize = initialize;
  exports.updatePosition = updatePosition;
}(typeof exports === 'undefined' ? this.bitbeambot = {} : exports));
