/*!
 * keyboard-coords
 * https://github.com/olihel/bitbeambot.git
 *
 * Copyright (c) 2013 Philipp Mohr
 * Released under MIT license
 */

(function () {
  var bot = require('./bitbeambot');
  var fs = require('fs');
  
  bot.initialize(function () {
  
    console.log('\n### hoverTo(xyz)');

    bot.updatePosition();
  });
}());
