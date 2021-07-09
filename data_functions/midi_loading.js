const midiParser = require('midi-parser-js')
const fs = require('fs')

function test_midi_loading() {
    const file = fs.readFileSync('./test_data/lindenbaum.mid', 'base64')
    return midiParser.parse(file)
}

module.exports = {test_midi_loading}