import fs from "fs";

export function fs_readFile (file) {
    return new Promise((resolve, reject) => fs.readFile(file, "utf8", (err, data) => {
        if (err) {
            reject(err)
        } else {
            resolve(data)
        }
    }))
}