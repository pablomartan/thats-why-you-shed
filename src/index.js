const bpm_input = Array.from(document.getElementsByTagName('input'))[0];
const play_button = document.querySelector('.play-button');
const stop_button = document.querySelector('.stop-button');

const audio_context = new AudioContext();
const beep = audio_context.createOscillator();
const beep_gain = audio_context.createGain();

const volumeDown = () => {
    beep_gain.gain.exponentialRampToValueAtTime(0.0001, audio_context.currentTime + 0.1);
};

const volumeUp = () => {
    beep_gain.gain.linearRampToValueAtTime(1, audio_context.currentTime + 0.1);
};

beep.type = 'sine';
beep.connect(beep_gain);
beep.start();

let metronome;

const startMetronome = () => {
    beep_gain.connect(audio_context.destination);
    volumeUp();
    volumeDown();

    const bpm = parseFloat(60/bpm_input.value) * 1000;
    let i = 0;

    return setInterval(() => {
        volumeUp();
        volumeDown();
        console.log('click nº ' + i++);
    }, bpm);
};

const stopMetronome = () => {
    beep_gain.disconnect();
    clearInterval(metronome);
};

play_button.addEventListener('click', () => { metronome = startMetronome(); });
stop_button.addEventListener('click', () => { stopMetronome(); });
