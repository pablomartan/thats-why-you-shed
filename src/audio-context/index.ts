export default class MetronomeAudio {
  audioContext: AudioContext;
  gainNode: GainNode;
  soundSource: OscillatorNode;

  constructor() {
    this.audioContext = new AudioContext();
    this.soundSource = this.audioContext.createOscillator();
    this.gainNode = this.audioContext.createGain();

    this.soundSource
      .connect(this.gainNode)
      .connect(this.audioContext.destination);

    this.soundSource.start();
    this.gainNode.gain.value = 0;

    this.tickSound = this.tickSound.bind(this);
    this.stop = this.stop.bind(this);
  }

  stop() {
    this.gainNode.gain.value = 0;
  }

  tickSound() {
    this.gainNode.gain.linearRampToValueAtTime(
      1,
      this.audioContext.currentTime + 0.1,
    );
    this.gainNode.gain.exponentialRampToValueAtTime(
      0.0001,
      this.audioContext.currentTime + 0.1,
    );
  }
}
