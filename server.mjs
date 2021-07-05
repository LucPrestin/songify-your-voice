import http from 'http'
import {fs_readFile} from './utils.mjs'
import {test_pitch_finding} from "./pitch-finding.mjs"

class Server {
    static async onRequest(req, res) {
        if (req.url.match(/\/pitch_finding_test/)) {
            res.writeHead(200, {"Content-Type": "text/html"})
            res.end(await fs_readFile('./pitch_finding_test.html'))
        } else if (req.url.match(/\/speech_synthesis_test/)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./speech_synthesis_test.html'))
        } else if (req.url.match(/\/load_example_pitches/)) {
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(await test_pitch_finding())
        } else if (req.url.match(/\//)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./index.html'))
        }
    }

    static async load() {
        console.log('Loading started')

        this._pitches = test_pitch_finding()

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
