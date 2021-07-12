const fs = require('fs')
const crypto = require('crypto')

function fs_readFile (path) {
    return new Promise((resolve, reject) => fs.readFile(path, "utf8", (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    }))
}

function get_new_id(processing_results) {
    let id = crypto.randomBytes(16).toString('hex')
    while (Object.keys(processing_results).includes(id)) {
        id = crypto.randomBytes(16).toString('hex')
    }
    return id
}

module.exports = {fs_readFile, get_new_id}