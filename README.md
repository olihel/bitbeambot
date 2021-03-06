# Bitbeambot

## The video game playing, software testing robot. 

[![bitbeambot on YouTube](https://raw.github.com/olihel/bitbeambot/master/video-preview.jpg)](http://www.youtube.com/watch?v=nnEBgGhImbA)

### Setup instructions (OSX)

- download and install [Arduino IDE](http://arduino.cc/en/Main/Software)
- Arduino IDE is bundled with an outdated version of [Firmata](https://github.com/firmata/arduino), so update it as [described](https://github.com/firmata/arduino#updating-firmata-in-the-arduino-ide)
- plug in your Arduino
- select the StandardFirmata example (File > Examples > Firmata > StandardFirmata)
- upload StandardFirmata to your Arduino
- clone this repo and install dependencies:

```Bash
git clone git@github.com:olihel/bitbeambot.git
cd bitbeambot
npm install
```

- run the robot scripts:

```Bash
node bot.js
node keyboard-angles.js
node keyboard-coords.js
node playback.js
```

### Credits
This project is based on work by Jason Huggins ([@github](https://github.com/hugs/bitbeambot), [bitbeam.org](http://bitbeam.org)), he actually provided the hardware parts, too.

Thanks to [SinnerSchrader](http://www.sinnerschrader.com/) for support and the time to work on this project.

[![githalytics.com alpha](https://cruel-carlota.gopagoda.com/4397db1898e2d1bbd187fb1856c11cb8 "githalytics.com")](http://githalytics.com/olihel/bitbeambot)
