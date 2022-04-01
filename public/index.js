const textarea = document.getElementById('input_text')
const file_input = document.getElementById('input_midi_file')
const songify_button = document.getElementById('button_songify')
const play_button = document.getElementById('button_play')
const download_button = document.getElementById('button_download')
const feedback_container = document.getElementById('feedback_container')

let context;

function preset_status () {
    let presets_matched = true
    let message = ''

    if (textarea.value === '') {
        presets_matched = false
        message += 'Please enter some text.\n'
    }
    if (!file_input.files[0]) {
        presets_matched = false
        message += 'Please enter a midi file.\n'
    }

    return {
        ok: presets_matched,
        message: message
    }
}

function playAudio(audioBuffer) {
    const source = context.createBufferSource()
    source.buffer = audioBuffer
    source.connect(context.destination)
    source.start(0)
}

songify_button.addEventListener('click', async () => {
    context = new AudioContext()

    const status = preset_status()
    if (!status.ok) {
        alert(status.message)
        return
    }

    songify_button.innerHTML = '<div class="loader"></div>'
    feedback_container.innerHTML += 'Splitting text into phonemes ... '

    const phonemes = await get_phonemes(textarea.value)

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Parsing midi file ... '

    const notes = await parseMidi(file_input.files[0]).then(result => result.tracks[0].notes)

    feedback_container.innerHTML += 'done.\n'
    feedback_container.innerHTML += 'Loading voice from server ... '

    const voice = await get_voice()

    feedback_container.innerHTML += 'done.\n'

    let result = await songify(phonemes, notes, voice, feedback_container)

    play_button.addEventListener('click', () => playAudio(result))
    download_button.href = URL.createObjectURL(bufferToWave(result, result.length));
    download_button.download = 'songified.wav'

    songify_button.innerHTML = 'Songify!'
    play_button.disabled = false
    download_button.classList.remove('disabled')

    feedback_container.innerHTML += '\n\n Have fun with your song :-)'
})
