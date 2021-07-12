const express = require('express')
const bodyParser = require('body-parser')

const utils = require('./scripts/utils.js')
const songify = require('./scripts/songify').songify
const {test_pitch_finding} = require("./scripts/pitch_finding")
const {test_midi_loading} = require("./scripts/midi_loading")

const app = express()

const processing_status = {
    waiting_for_input: 0,
    ready: 1,
    done: 2
}

const usage = 'Usage of this service:\n'+
    '1. request an id\n' +
    '2. send a text and midi file with your id via a post request to /songifying_parameters\n' +
    '3. send a get request to /songified_text with your id'

/*
* format:
* id: {
*   status: <a processing_status value>,
*   text: <the text that is to songify>,
*   midi: <the midi data from which to take the melody>
*   result: <the resulting wav data>
* }
* */
let processing_results = {}

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

app.get('/', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(await utils.fs_readFile('./view/index.html'))
})

app.get('/processing_id', async (req, res) => {
    res.writeHead(200, {"Content-Type": "text/plain"})
    const id = utils.get_new_id(processing_results)
    processing_results[id] = {
        status: processing_status.waiting_for_input,
        midi: null,
        text: null
    }
    res.end(id)
})

app.get('/pitch_finding_test', async (req, res) => {
    res.writeHead(200, {"Content-Type": "text/html"})
    res.end(await utils.fs_readFile('./view/pitch_finding_test.html'))
})

app.get('/speech_synthesis_test', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(await utils.fs_readFile('./view/speech_synthesis_test.html'))
})

app.get('/midi_input_test', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'text/html'})
    res.end(await utils.fs_readFile('./view/midi_input_test.html'))
})

app.get('/data/load_example_pitches', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(test_pitch_finding()))
})

app.get('/data/load_example_midi', async (req, res) => {
    res.writeHead(200, {'Content-Type': 'application/json'})
    res.end(JSON.stringify(test_midi_loading()))
})

app.get('/songified_text', async (req, res) => {
    if (!perform_id_check(req, res)) return

    const processing_result = processing_results[req.query.id]
    switch (processing_result.status) {
        case processing_status.waiting_for_input:
            res.writeHead(400, {'Content-Type': 'text/plain'})
            res.end('Missing input data.' + usage)
            break
        case processing_status.ready:
            processing_result.result = await songify(processing_result.text, processing_result.midi)
            processing_result.status = processing_status.done
            //res.writeHead(200, {'Content-Type': 'audio/ogg'})

            //TODO: replace this with an ogg stream, as soon and the songify function is implemented
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(processing_result.result))

            break
        case processing_status.done:
            //res.writeHead(200, {'Content-Type': 'audio/ogg'})

            //TODO: replace this with an ogg stream, as soon and the songify function is implemented
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(processing_result.result))

            break
    }
})

app.post('/songifying_parameters', async (req, res) => {
    if (!perform_id_check(req, res)) return

    const processing_result = processing_results[req.query.id]

    processing_result.text = req.body.text
    processing_result.midi = req.body.midi
    processing_result.status = processing_status.ready

    res.writeHead(200)
    res.end()
})

function perform_id_check(req, res) {
    const id = req.query.id

    if (!id) {
        res.writeHead(400, {'Content-Type': 'text/plain'})
        res.end('Missing id in query string parameters' + usage)
        return false
    }

    if (!Object.keys(processing_results).includes(id)) {
        res.writeHead(400, {'Content-Type': 'text/plain'})
        res.end('Id not found.' + usage)
        return false
    }

    return true
}

app.listen(8080)
