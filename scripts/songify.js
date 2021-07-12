const spawn = require('child_process').spawn

async function songify (text, midi) {
    //get phonemes from the text
    let phonemes = await split_into_phonemes(text)

    //TODO: Get pitches and durations from the midi file
    //TODO: map notes to phonemes
    //TODO: generate sung version of each phoneme in its note
    //TODO: concatenate sung phonemes to a song
    //TODO: return song

    // Only temporary
    if (phonemes) {
        return phonemes
    } else {
        return []
    }
}

function split_into_phonemes(text) {
    return new Promise(((resolve, reject) => {
        const ls = spawn('python3', ['scripts/phoneme_splitting.py', text])

        const out = []
        const err = []
        ls.stdout.on('data', data => out.push(data.toString()))
        ls.stderr.on('data', data => err.push(data.toString()))

        ls.on('exit', code => {
            if (code === 0) {
                resolve(out)
            } else {
                reject(new Error(JSON.stringify(err)))
            }
        })
    }))
}

module.exports = {songify}