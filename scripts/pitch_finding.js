const fs =require('fs')
const WavDecoder = require('wav-decoder')
const Pitchfinder = require('pitchfinder')

function test_pitch_finding() {
    const detectPitch = Pitchfinder.YIN()

    const buffer = fs.readFileSync('../test_data/lindenbaum_spoken_with_rhythm.wav')
    const decoded = WavDecoder.decode.sync(buffer)

    return Pitchfinder.default.frequencies(
        [detectPitch, Pitchfinder.AMDF()],
        decoded.channelData[0],
        {tempo: 70, quantization: 4, sampleRate: 44100}
    )
}

module.exports = {test_pitch_finding}
