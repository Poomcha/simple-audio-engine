class Sound {
  private sourceNode: AudioBufferSourceNode | undefined = undefined;
  private gainNode: GainNode | undefined = undefined;

  constructor(
    public name: string,
    public source: string,
    public loop: boolean,
    public audioContext: AudioContext
  ) {
    this.name = name;
    this.source = source;
    this.loop = loop;
    this.audioContext = audioContext;
  }

  async loadSound(): Promise<AudioBuffer> {
    const response = await fetch(this.source);
    const audioData = await response.arrayBuffer();
    return this.audioContext.decodeAudioData(audioData);
  }

  play(): void {
    this.loadSound().then((audioBuffer: AudioBuffer) => {
      this.sourceNode = this.audioContext.createBufferSource();
      this.sourceNode.buffer = audioBuffer;
      this.sourceNode.loop = this.loop;
      this.sourceNode.connect(this.audioContext.destination);
      this.sourceNode.start(0);
    });
  }

  stop() {
    if (this.sourceNode) {
      this.sourceNode.stop(0);
    }
  }

  pause() {
    if (this.sourceNode) {
      if (this.audioContext.currentTime !== 0) {
        this.sourceNode.stop(this.audioContext.currentTime);
      } else {
        this.stop();
      }
    }
  }

  resume(): void {
    if (this.sourceNode) {
      if (this.audioContext.currentTime !== 0) {
        this.sourceNode.start(this.audioContext.currentTime);
      } else {
        this.play();
      }
    }
  }

  mute(): void {
    if (this.sourceNode) {
      if (!this.gainNode) {
        this.gainNode = this.audioContext.createGain();
        this.sourceNode.connect(this.gainNode);
        this.gainNode.connect(this.audioContext.destination);
      }
      this.gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
    }
  }

  unmute(): void {
    if (this.gainNode) {
      this.gainNode.gain.setValueAtTime(1, this.audioContext.currentTime);
    }
  }

  setLoop(loop: boolean): void {
    this.loop = loop;
    if (this.sourceNode) {
      this.sourceNode.loop = loop;
    }
  }
}

export default Sound;
