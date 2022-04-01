const spawn = require('child_process').spawn

function split_into_phonemes(text) {
    return new Promise((resolve, reject) => {
        const ls = spawn('python3', ['private/phoneme_splitting.py', text])

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

module.exports = {split_into_phonemes}
