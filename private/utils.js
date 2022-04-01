const fs = require('fs')

const get_directories = source => new Promise((resolve, reject) => {
    fs.readdir(source, {withFileTypes: true}, (err, files) => {
        if (err) {
            reject(err)
        } else {
            resolve(files
                .filter(dirent => dirent.isDirectory())
                .map(dirent => dirent.name)
            )
        }
    })
})

const get_files = source => new Promise((resolve, reject) => {
    fs.readdir(source, {withFileTypes: true}, (err, files) => {
        if (err) {
            reject(err)
        } else {
            resolve(files
                .filter(dirent => dirent.isFile() && dirent.name !== '.gitkeep')
                .map(dirent => dirent.name)
            )
        }
    })
})

module.exports = {get_directories, get_files}
