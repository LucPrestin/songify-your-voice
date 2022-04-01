const parseMidi = file => new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => {
        const midi = new Midi(reader.result)
        resolve(midi)
    }
    reader.onerror = error => reject(error)
    reader.readAsArrayBuffer(file)
})
