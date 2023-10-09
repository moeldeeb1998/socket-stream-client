import { io } from "socket.io-client";

export class Initializer {
  mediaStream = null;
  socket = null;

  constructor() {
    this.socket = io("ws://localhost:5000", {
      path: "/sockets",
      transports: ["websocket"],
    });
  }

  getMediaStream() {
    return this.mediaStream;
  }

  getSocket() {
    return this.socket;
  }

  async openAudioAsync() {
    this.mediaStream = await navigator.mediaDevices.getUserMedia({
      audio: true,
    });
    return this.mediaStream;
  }

  closeAudio = () => {
    if (this.mediaStream) {
      const audioTracks = this.mediaStream.getAudioTracks();
      audioTracks.forEach((track) => track.stop());
      this.mediaStream = null;
    }
  };
}
