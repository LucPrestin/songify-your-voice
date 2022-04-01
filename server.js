const express = require('express')
const app = express()
const server = require('http').createServer(app)
const io = require('socket.io')(server)

const load_audio = require('audio-loader')
const Pitchfinder = require("pitchfinder");

const {split_into_phonemes} = require('./private/phoneme_splitting')
const {get_directories, get_files} = require('./private/utils')

const voices = {}

async function load_voices () {
    console.log('loading voices ... ')
    const voice_directories = await get_directories('./phoneme_recordings/')
    for (const voice_directory of voice_directories) {
        voices[voice_directory] = {}
        const voice_files = await get_files(`./phoneme_recordings/${voice_directory}`)
        for (const voice_file of voice_files) {
            const voice_name = voice_file.replace('.wav', '')
            voices[voice_directory][voice_name] = await load_audio(`./phoneme_recordings/${voice_directory}/${voice_file}`)
        }
    }
    console.log('done')
}

app.use((req, res, next) => {
    console.log(req.method, req.url)
    next()
})

app.use(express.static(__dirname + '/view'))
app.use(express.static(__dirname + '/public'))

app.get('/', async (req, res) => {
    res.sendFile('index.html')
})

io.on('connection', (socket) => {
    socket.on('get_phonemes', async (text) => {
        socket.emit('phonemes', await split_into_phonemes(text))
    })

    socket.on('get_voice', () => {
        const voice = voices[Object.keys(voices)[0]]
        socket.emit('voice', JSON.stringify(voice))
    })

    socket.on('get_pitch', (buffer_strings) => {
        const channel_data_length = Object.keys(buffer_strings).length

        const array_buffer = new ArrayBuffer(channel_data_length * 4)
        const array_buffer_view = new Float32Array(array_buffer)

        for (let data_index = 0; data_index < channel_data_length; data_index++) {
            array_buffer_view[data_index] = parseFloat(buffer_strings[data_index])
        }

        socket.emit('pitch', Pitchfinder.YIN()(array_buffer_view).toString())
    })
})

server.listen(3000, async () => {
    await load_voices()
})
