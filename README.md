# songify-your-voice

## Dependencies that need to be installed manually

- Node.js
- npm
- python 3.x
- python-pip

## Installation

- make sure to have the above-mentioned dependencies installed
- clone the repository: ```git clone git@github.com:LucPrestin/songify-your-voice.git```
- make recordings of the phonemes of the english language
  - the list that we used: [http://www.speech.cs.cmu.edu/cgi-bin/cmudict](http://www.speech.cs.cmu.edu/cgi-bin/cmudict)
  - for each phoneme, record its sound and create a `<phoneme_name>.wav` file
  - place the recordings into a voice folder within the `phoneme_recordings` folder
- run the installation script: ```npm install```
- run the start script: ```npm start```
- visit `localhost:3000`

## Tested environments

- **Browser**: Chromium Version 93.0.4577.82 (Official Build) Arch Linux (64-bit)
- **OS running nodejs**: Manjaro Linux 21.1.3

## Future Work

- Delete this repository and load the code in a new one the delete the test recordings we made
- Fix the pitch shifting [(issue #31)](https://github.com/LucPrestin/songify-your-voice/issues/31)
