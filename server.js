const http = require('http')
const fs_readFile = require('./data_functions/utils.js').fs_readFile

const {test_pitch_finding} = require("./data_functions/pitch_finding")
const {test_midi_loading} = require("./data_functions/midi_loading");

class Server {
    static async onRequest(req, res) {
        console.log(`request: ${req.method} ${req.url}`)
        if (req.url === '/') {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./view/index.html'))
        } else if (req.url.match(/\/pitch_finding_test/)) {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(await fs_readFile('./view/pitch_finding_test.html'))
        } else if (req.url.match(/\/speech_synthesis_test/)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./view/speech_synthesis_test.html'))
        } else if (req.url.match(/\/midi_input_test/)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./view/midi_input_test.html'))
        } else if (req.url.match(/\/data\/load_example_pitches/)) {
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(test_pitch_finding()))
        } else if (req.url.match(/\/data\/load_example_midi/)) {
            res.writeHead(200, {'Content-Type': 'application/json'})
            res.end(JSON.stringify(test_midi_loading()))
        }
    }

    static async start() {
        console.log('Server boot started')

        this.port = 8080
        http.createServer((req, res) => this.onRequest(req, res))
            .listen(this.port, function (error) {
                if (error) {
                    throw error
                }
            })

        console.log('Server boot finished')
    }
}

Server.start();
