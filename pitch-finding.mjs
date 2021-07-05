import fs from 'fs'
import WavDecoder from 'wav-decoder'
import Pitchfinder from 'pitchfinder'

export function test_pitch_finding() {
    const detectPitch = Pitchfinder.YIN()

    const buffer = fs.readFileSync('./test_data/lindenbaum_spoken_with_rhythm.wav')
    const decoded = WavDecoder.decode.sync(buffer)

    return Pitchfinder.default.frequencies(
        [detectPitch, Pitchfinder.AMDF()],
        decoded.channelData[0],
        {tempo: 70, quantization: 4, sampleRate: 44100}
    )
}
