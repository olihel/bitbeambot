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
  var axes = [0, 0, config.origin.z];  // x, y, z

  var tweenable = new Tweenable({
    easing: 'easeOutCubic'
  });

  var updatePosition = function (x,y,z) {
    var x = x || axes[0];
    var y = y || axes[1];
    var z = z || axes[2];

    var angles = ik.inverse(x,y,z);
    servo1.move(angles[1],true);
    servo2.move(angles[2],true);
    servo3.move(angles[3],true);
  };

  var getPositions = function (){
    return ik.forward(servo1.last.degrees, servo2.last.degrees, servo3.last.degrees);
  }

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
    var sourceCoords  = getPositions();
    var targetCoords  = [0,x,y,z];
    var steps = 20;

    var increment = sourceCoords.map(function (sourceCoordsValue,index) {
      var inc = Math.abs(sourceCoordsValue-targetCoords[index]) / steps; 
      return targetCoords[index] < sourceCoordsValue ? -inc : inc;
    });

    if(increment[1] == 0 && increment[2] == 0 && increment[3] == 0) return;

    var inter = setInterval(
        function(){
          var lastCoords  = getPositions();
          
          axes[0] = lastCoords[1] + increment[1];
          axes[1] = lastCoords[2] + increment[2];
          axes[2] = lastCoords[3] + increment[3];
          
          updatePosition();
          
          if(--steps <= 0 ){
            clearInterval(inter);
            //trigger some event
          }
    },50);
    return exports;
  };

 var down = function(){
   var zDown = -110;
   var position = getPositions();
   updatePosition(position[1],position[2],-100); // first go to -100 to throttle down movement
   setTimeout(updatePosition,100,position[1],position[2],zDown); //down
   return {'down':zDown,'up':position[3]};
 }

 var up = function(z){
   var position = getPositions();
   if(position[3] > -109) return false; // if robot is not down return
   updatePosition(position[1],position[2],-100); //up
   setTimeout(updatePosition,100,position[1],position[2],z); //up to latest position
   
 }

 var tap = function(){
   var oz = down();
   setTimeout(up,250,oz.up);
   return exports;
}
  
 var swipe = (function(){
   
   var swipeIt = function(xTarget,position){
     var oz = down();
     var position = getPositions();
     setTimeout(updatePosition,170,position[1],xTarget,oz.down);
     setTimeout(updatePosition,300,position[1],xTarget,oz.up);//hoverTo?

     setTimeout(updatePosition,600,position[1],position[2],oz.up);
   }

   var left = function(length){
       var position = getPositions();
       var l = length || 20;
       swipeIt(position[2]-l,position);
     }
   var right = function(length){
       var position = getPositions();
       var l = length || 20;
       swipeIt(position[2]+l,position);
     }

    return {'left':left,'right':right};
  })();



  var drawCircles = function(circleCount,speed,radius,spiral,eight,z){
    var h = 0,
    k = 0,
    count = 0,
    theta = 0,
    r = radius || 10,
    speed = speed || 50,
    maxcount = circleCount || 1,
    z = z || config.origin.z,
    step = 2*Math.PI/(2*r),
    eight = eight ? 2 : 1,
    spiral = spiral ? true : false;    
    var move = function(){
      var x = h + r*Math.cos(theta),
      y = k - r*Math.sin(theta * eight);
      //console.log([x,y,z]);
      axes[0] = x;
      axes[1] = y;
      axes[2] = z;
      updatePosition();
      //moveTo(x,y,z);
      theta += step;
      if(theta < 2*Math.PI){
        setTimeout(move,speed);
      }else{
        count++;
        if(count >= maxcount || r <= 1){
          return moveToOrigin();
        }
        if(spiral){
          r = (count <= maxcount/2) ? r+3 : r-3;
        }
        theta = 0;
        setTimeout(move,speed);
      }
    }
    move();
  };
  
  var draw = {
    'eight' : function(circleCount, speed, radius, z){
      drawCircles(circleCount, speed, radius, false, true, z);
      return "start drawing 8!"
    },
    'helix' : function(circleCount, speed, radius, z){
      drawCircles(circleCount, speed, radius, true, false, z);
      return "starting helix!"
    },
    'circle' : function(circleCount, speed, radius, z){
      drawCircles(circleCount, speed, radius, false, false, z);
      return "start circling!"
    }
  };

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
    }if (direction === 't') {
      tap();
    }if (direction === 'k') {
      swipe.right();
    }if (direction === 'l') {
      swipe.left();
    }if (direction === 'c') {
      moveToOrigin();
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
        hoverTo: hoverTo,
        draw: draw,
        tap: tap,
        swipe: swipe
      });

      servo1.on('error', function () { console.log(arguments); });
      servo2.on('error', function () { console.log(arguments); });
      servo3.on('error', function () { console.log(arguments); });
     
      servo1.on("move", function( err, degrees ) {
       console.log( "NAAARF" );
      });

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