const fs = require('fs')

function fs_readFile (path) {
    return new Promise((resolve, reject) => fs.readFile(path, "utf8", (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    }))
}

module.exports = {fs_readFile}