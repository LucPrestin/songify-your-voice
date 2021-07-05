const http = require('http')
const fs_readFile = require('./utils.js').fs_readFile
const test_pitch_finding = require('./pitch-finding.js').test_pitch_finding
const test_midi_loading = require('./midi_loading.js').test_midi_loading

class Server {
    static async onRequest(req, res) {
        if (req.url.match(/\/pitch_finding_test/)) {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(await fs_readFile('./pitch_finding_test.html'))
        } else if (req.url.match(/\/speech_synthesis_test/)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./speech_synthesis_test.html'))
        } else if (req.url.match(/\/midi_input_test/)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./midi_input_test.html'))
        } else if (req.url.match(/\/load_example_pitches/)) {
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(await test_pitch_finding())
        } else if (req.url.match(/\/load_example_midi/)) {
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(await test_midi_loading())
        } else if (req.url.match(/\//)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./index.html'))
        }
    }

    static async load() {
        console.log('Loading started')

        //this._pitches = test_pitch_finding()
        this._pitches = {}

        console.log('Loading finished')
    }

    static async start() {
        console.log('Server boot started')

        await this.load()

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
