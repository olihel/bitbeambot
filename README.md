# Bitbeambot

## The video game playing, software testing robot. 

### Setup instructions (OSX)

- download and install [Arduino IDE](http://arduino.cc/en/Main/Software)
- Arduino IDE is bundled with an outdated version of [Firmata](https://github.com/firmata/arduino), so update it as [described](https://github.com/firmata/arduino#updating-firmata-in-the-arduino-ide)
- plug in your Arduino
- select the StandardFirmata example (File > Examples > Firmata > StandardFirmata)
- upload StandardFirmata to your Arduino
- clone this repo and install dependencies:

```Bash
git clone git@github.com:hugs/bitbeambot.git
cd bitbeambot
npm install
```

- run the robot script:

```Bash
node bot.js
```
