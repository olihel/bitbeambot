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
  var CONFIG_DEFAULT = {
    origin: {
      x: 0,
      y: 0,
      z: -100
    },
    movement: {
      stepX: 1,
      stepY: 1,
      stepZ: 1
    },
    board: {
      debug: false
    },
    tween: {
      duration: 400
    }
  };

  var fs = require('fs');
  var five = require('johnny-five');
  var ik = require('./ik');
  var Tweenable = require('./shifty');

  var config = fs.existsSync(CONFIG_FILE) ? JSON.parse(fs.readFileSync(CONFIG_FILE)) : CONFIG_DEFAULT;
  var board = new five.Board(config.board);
  var servo1, servo2, servo3, servos;
  var axes = [0, 0, -100];  // x, y, z

  var tweenable = new Tweenable({
    easing: 'easeOutCubic'
  });

  var updatePosition = function () {
    var angles = ik.inverse(axes[0], axes[1], axes[2]);
    servo1.move(angles[1]);
    servo2.move(angles[2]);
    servo3.move(angles[3]);
  };

  var moveTo = function (x, y, z) {
    tweenable.tween({
      from: { x: axes[0], y: axes[1], z: axes[2] },
      to: { x: x, y: y, z: z },
      duration: config.tween.duration,
      step: function (e) {
        axes[0] = e.x;
        axes[1] = e.y;
        axes[2] = e.z;
        updatePosition();
      },
      callback: function () {
        console.log('x:', axes[0], 'y:', axes[1], 'z:', axes[2]);
      }
    });
  };

  var hoverTo = function (x,y,z){
    var sourceCoords  = ik.forward(servo1.last.degrees, servo2.last.degrees, servo3.last.degrees);
    var targetCoords  = [0,x,y,z];
    var steps = 20;

    var increment = sourceCoords.map(function (sourceCoordsValue,index) {
      var inc = Math.abs(sourceCoordsValue-targetCoords[index]) / steps; 
      return targetCoords[index] < sourceCoordsValue ? -inc : inc;
    });

    if(increment[1] == 0 && increment[2] == 0 && increment[3] == 0) return;

    var inter = setInterval(
        function(){
          var lastCoords  = ik.forward(servo1.last.degrees, servo2.last.degrees, servo3.last.degrees);
          
          axes[0] = lastCoords[1] + increment[1];
          axes[1] = lastCoords[2] + increment[2];
          axes[2] = lastCoords[3] + increment[3];
          
          updatePosition();
          
          if(--steps <= 0 ){
            clearInterval(inter)
          }
        },50);
  }

  var moveToOrigin = function () {
    moveTo(config.origin.x, config.origin.y, config.origin.z);
  };

  var moveRelative = function (direction) {
    if (direction === 'up') {
      axes[0] += -config.movement.stepX;
      updatePosition();
    } else if (direction === 'down') {
      axes[0] += config.movement.stepX;
      updatePosition();
    } if (direction === 'left') {
      axes[1] += config.movement.stepY;
      updatePosition();
    } if (direction === 'right') {
      axes[1] += -config.movement.stepY;
      updatePosition();
    } if (direction === 'q') {
      axes[2] += config.movement.stepZ;
      updatePosition();
    } if (direction === 'a') {
      axes[2] += -config.movement.stepZ;
      updatePosition();
    }
  };

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
        servos: servos,
        moveTo: moveTo,
        moveToOrigin: moveToOrigin,
        hoverTo: hoverTo
      });

      servo1.on('error', function () { console.log(arguments); });
      servo2.on('error', function () { console.log(arguments); });
      servo3.on('error', function () { console.log(arguments); });

      moveToOrigin();

      readyHandler();
    });
  };

  exports.config = config;
  exports.axes = axes;
  exports.initialize = initialize;
  exports.updatePosition = updatePosition;
  exports.moveRelative = moveRelative;
  exports.moveTo = moveTo;
  exports.moveToOrigin = moveToOrigin;
  exports.hoverTo = hoverTo;
}(typeof exports === 'undefined' ? this.bitbeambot = {} : exports));
