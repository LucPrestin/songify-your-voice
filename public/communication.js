const socket = io()

function audiobuffer_from_object(audio_object) {
    const AudioContext = window.AudioContext || window.webkitAudioContext;
    const context = new AudioContext()
    const buffer = context.createBuffer(audio_object.numberOfChannels, audio_object.length, audio_object.sampleRate)

    for (let channel_number = 0; channel_number < audio_object.numberOfChannels; channel_number++) {
        const channel_data = audio_object._channelData[channel_number.toString()]
        const channel_data_length = Object.keys(channel_data).length
        const array_buffer = new ArrayBuffer(channel_data_length * 4)
        const array_buffer_view = new Float32Array(array_buffer)

        for (let data_index = 0; data_index < channel_data_length; data_index++) {
            array_buffer_view[data_index] = channel_data[data_index.toString()]
        }

        buffer.copyToChannel(array_buffer_view, channel_number, 0)
    }

    return buffer
}

function get_phonemes (text) {
    return new Promise((resolve) => {
        socket.emit('get_phonemes', text)
        socket.on('phonemes', (phonemes) => {
            resolve(phonemes)
        })
    })
}

function get_voice() {
    return new Promise(((resolve) => {
        socket.emit('get_voice')
        socket.on('voice', async (voice_string) => {
            const voice = JSON.parse(voice_string)
            const result = {}

            for (const key of Object.keys(voice)) {
                result[key] = audiobuffer_from_object(voice[key])
            }

            resolve(result)
        })
    }))
}

function get_pitch(float32array) {
    return new Promise(resolve => {
        debugger
        const parameter = []
        float32array.forEach(entry => parameter.push(entry.toFixed(4)))
        socket.compress(true).emit('get_pitch', parameter)
        socket.on('pitch', (pitch) => {
            resolve(parseFloat(pitch))
        })
    })
}
