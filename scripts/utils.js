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

function get_new_id(processing_results) {
    let i = 0
    while (Object.keys(processing_results).includes(i.toString())) {
        i++
    }
    return i.toString()
}

module.exports = {fs_readFile, get_new_id}