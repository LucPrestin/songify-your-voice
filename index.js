const http = require("http")
const fs = require("fs")
const pitch_finder = require("./pitch-finding.js");

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
        if (req.url.match(/\//)) {
            res.writeHead(200, {'Content-Type': 'text/html'})
            res.end(await fs_readFile('./index.html'))
        }

        if (req.url.match(/\/pitch_finding_test/)) {
            res.writeHead(200, {'Content-Type': 'text/plain'})
            let frequencies = pitch_finder.test_pitch_finding()
            let result = JSON.stringify(frequencies)
            res.end(result)
        }

        //res.end("NO MATCHES")
    }

    static async start() {
        this.port = 8080
        http.createServer((req, res) => this.onRequest(req, res))
            .listen(this.port, function (error) {
                if (error) {
                    throw error
                }
            });
    }
}

Server.start()