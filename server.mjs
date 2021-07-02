import http from 'http'
import fs from 'fs'
import {test_pitch_finding} from "./pitch-finding.js"

let fs_readFile = function(file) {
    return new Promise((resolve, reject) => fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    }))
};

class Server {
    static async onRequest(req, res) {
        if (req.url.match(/\/pitch_finding_test/)) {
            res.writeHead(200, {"Content-Type": "application/json"})
            res.end(JSON.stringify(this._pitches))
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