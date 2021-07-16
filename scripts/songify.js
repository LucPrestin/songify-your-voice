const spawn = require('child_process').spawn

async function songify (text, midi) {
    // Get phonemes from the text
    const phonemes = await split_into_phonemes(text)

    // Get pitches and durations from the midi file
    const notes = midi.tracks[0].notes

    // map notes to phonemes
    const phoneme_note_map = map_phonemes_to_notes(phonemes, notes)

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

function map_phonemes_to_notes(phonemes, notes) {
    const result = []

    let note_index = 0

    for (let phoneme_index = 0; phoneme_index < phonemes.length; phoneme_index++) {
        const phoneme = phonemes[phoneme_index]
        if (is_vowel(phoneme)) {
            result.push({
                phoneme: phoneme,
                note: notes[note_index]
            })
            note_index++
        } else {
            result.push({
                phoneme: phoneme,
                note: null
            })
        }
    }

    return result
}

function is_vowel(phoneme) {
    const vowels = ['a', 'A', 'e', 'E', 'i', 'I', 'o', 'O', 'u', 'U']

    for (let i = 0; i < vowels.length; i++) {
        if (phoneme.includes(vowels[i])) {
            return true
        }
    }

    return false
}

function split_into_phonemes(text) {
    return new Promise((resolve, reject) => {
        const ls = spawn('python3', ['scripts/phoneme_splitting.py', text])

        const out = []
        const err = []
        ls.stdout.on('data', data => out.push(data.toString()))
        ls.stderr.on('data', data => err.push(data.toString()))

        ls.on('exit', code => {
            if (code === 0) {
                let result = out[0]
                result = result.replace(/[\n\r]/g, '')

                while(result.match(/'/)) {
                    result = result.replace(/'/, '\"')
                }

                resolve(JSON.parse(result))
            } else {
                reject(JSON.stringify(err))
            }
        })
    })
}

module.exports = {songify}