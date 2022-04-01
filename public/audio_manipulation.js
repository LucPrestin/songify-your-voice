async function songify(phonemes, notes, voice, feedback_container) {

    feedback_container.innerHTML += 'Preparing process ... '

    // remove numbers in the phoneme notation that
    // differentiate stressed and non-stressed phonemes
    phonemes.forEach((phoneme, index) => {
        if (phoneme.length >= 3) {
            phonemes[index] = phoneme.substr(0, 2)
        }
    })

    let phoneme_transformations = phonemes.map(phoneme => {
        return {
            text: phoneme,
            note: null,
            note_frequency: null,
            current_frequency: null,
            audio: null
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Mapping phonemes to notes ... '

    // map phonemes to notes
    let note_index = 0
    phoneme_transformations.forEach(entry => {
        if (is_vowel(entry.text)) {
            entry.note = notes[note_index]
            note_index++
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Mapping phonemes to voice audio ... '

    // map phonemes to voice audio
    phoneme_transformations.forEach(entry => {
        if (Object.keys(voice).includes(entry.text)) {
            entry.audio = voice[entry.text]
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Adapting audio length to notes ... '

    // adapt audio lengths to the notes
    phoneme_transformations.forEach(entry => {
        if (entry.audio && entry.note) {
            entry.audio = adapt_audio_length_to_note(entry.audio, entry.note.duration)
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Adapting audio gain to note velocity ... '

    // adapt audio gain to note velocity
    phoneme_transformations.forEach(entry => {
        if (entry.audio && entry.note) {
            entry.audio = adapt_audio_velocity_to_note(entry.audio, entry.note.velocity)
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Calculating target frequencies from notes ... '

    phoneme_transformations.forEach(entry => {
        if (entry.note) {
            entry.note_frequency = Tone.Frequency(entry.note.name).toFrequency()
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Calculating current frequencies from audio ... '

    for (const entry of phoneme_transformations) {
        if (entry.note && entry.audio) {
            entry.current_frequency = await get_pitch(entry.audio.getChannelData(0))
        }
    }

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Applying pitch-shifting ... '

    // apply pitch shifting to the audio to match its target note
    phoneme_transformations.forEach(entry => {
        if (entry.audio && entry.note_frequency && entry.current_frequency) {
            for (let channel_number = 0; channel_number < entry.audio.numberOfChannels; channel_number++) {
                const shifted_buffer = PitchShift(
                    entry.note_frequency / entry.current_frequency,
                    entry.audio.length,
                    1024,
                    10,
                    context.sampleRate,
                    entry.audio.getChannelData(channel_number)
                )
                entry.audio.copyToChannel(Float32Array.from(shifted_buffer), channel_number, 0)
            }
        }
    })

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Post-processing ... '

    // concatenate the transformed phoneme recordings
    let result = new AudioBuffer({
        numberOfChannels: 2,
        length: 1,
        sampleRate: 44100
    })

    for (let i = 0; i < phoneme_transformations.length; i++) {
        if (phoneme_transformations[i].audio) {
            result = appendBuffer(result, phoneme_transformations[i].audio)
        }
    }

    feedback_container.innerHTML += 'done.'

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

// Most simple version. Works for now, as the phonemes are quite consistent in their sound
// Should probably be proper time-stretching with a phase vocoder or Sinusoidal spectral modeling (future work)
// https://en.wikipedia.org/wiki/Audio_time_stretching_and_pitch_scaling
function adapt_audio_length_to_note(audiobuffer, target_duration) {
    let result = new AudioBuffer({
        numberOfChannels: audiobuffer.numberOfChannels,
        length: 1,
        sampleRate: audiobuffer.sampleRate
    })

    while (result.duration < target_duration) {
        result = appendBuffer(result, audiobuffer)
    }

    return result
}

function adapt_audio_velocity_to_note(audiobuffer, velocity) {
    const result = new AudioBuffer({
        numberOfChannels: audiobuffer.numberOfChannels,
        length: audiobuffer.length,
        sampleRate: audiobuffer.sampleRate
    })

    for (let channel = 0; channel < audiobuffer.numberOfChannels; channel++) {
        let buffer = audiobuffer.getChannelData(channel)
        for (let i = 0; i < audiobuffer.length; i++) {
            buffer[i] = buffer[i] * velocity
        }
        result.copyToChannel(buffer, channel, 0)
    }

    return result
}

// https://stackoverflow.com/questions/14143652/web-audio-api-append-concatenate-different-audiobuffers-and-play-them-as-one-son
function appendBuffer(buffer1, buffer2) {
    const number_of_channels = Math.min(buffer1.numberOfChannels, buffer2.numberOfChannels)

    const tmp = new AudioBuffer({
        numberOfChannels: number_of_channels,
        length: buffer1.length + buffer2.length,
        sampleRate: Math.max(buffer1.sampleRate, buffer2.sampleRate)
    })

    for (let i = 0; i < number_of_channels; i++) {
        const channel = tmp.getChannelData(i);

        channel.set( buffer1.getChannelData(i), 0);
        channel.set( buffer2.getChannelData(i), buffer1.length);
    }

    return tmp;
}

// https://www.russellgood.com/how-to-convert-audiobuffer-to-audio-file/
// Convert an AudioBuffer to a Blob using WAVE representation
function bufferToWave(audioBuffer, len) {
    let numOfChan = audioBuffer.numberOfChannels,
        length = len * numOfChan * 2 + 44,
        buffer = new ArrayBuffer(length),
        view = new DataView(buffer),
        channels = [], i, sample,
        offset = 0,
        pos = 0;

    // write WAVE header
    setUint32(0x46464952);                         // "RIFF"
    setUint32(length - 8);                         // file length - 8
    setUint32(0x45564157);                         // "WAVE"

    setUint32(0x20746d66);                         // "fmt " chunk
    setUint32(16);                                 // length = 16
    setUint16(1);                                  // PCM (uncompressed)
    setUint16(numOfChan);
    setUint32(audioBuffer.sampleRate);
    setUint32(audioBuffer.sampleRate * 2 * numOfChan); // avg. bytes/sec
    setUint16(numOfChan * 2);                      // block-align
    setUint16(16);                                 // 16-bit (hardcoded in this demo)

    setUint32(0x61746164);                         // "data" - chunk
    setUint32(length - pos - 4);                   // chunk length

    // write interleaved data
    for(i = 0; i < audioBuffer.numberOfChannels; i++) {
        channels.push(audioBuffer.getChannelData(i));
    }

    while(pos < length) {
        for(i = 0; i < numOfChan; i++) {             // interleave channels
            sample = Math.max(-1, Math.min(1, channels[i][offset])); // clamp
            sample = (0.5 + sample < 0 ? sample * 32768 : sample * 32767)|0; // scale to 16-bit signed int
            view.setInt16(pos, sample, true);          // write 16-bit sample
            pos += 2;
        }
        offset++                                     // next source sample
    }

    // create Blob
    return new Blob([buffer], {type: "audio/wav"});

    function setUint16(data) {
        view.setUint16(pos, data, true);
        pos += 2;
    }

    function setUint32(data) {
        view.setUint32(pos, data, true);
        pos += 4;
    }
}
