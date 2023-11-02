import { getSpaceUntilMaxLength } from "@testing-library/user-event/dist/utils";
import { io } from "socket.io-client";

export class Initializer {
  mediaStream = null;
  socket = null;
  recordingId = null;
  file = "";
  constructor() {
    this.socket = io("ws://192.168.212.76:5000", {
      path: "/sockets",
      transports: ["websocket"],
    });
    this.handleEvents();
  }

  handleEvents() {
    console.log(`🔥: ${this.socket.id} user is connected`);
    this.socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });
  }

  startRecording() {
    this.socket.emit("start-recording", { data2: "hi" });
    this.socket.on("recording-started", (data) => {
      console.log(`🎙️: user sends start recording2`);
      console.log(JSON.parse(data).recordingId);
      this.recordingId = JSON.parse(data).recordingId;
    });
  }

  sendChunks(chunk) {
    this.socket.emit(
      "recording-chunk",
      JSON.stringify({
        recordingId: this.recordingId,
        data: chunk,
      })
    );
    this.socket.on("chunk-result", (data) => {
      console.log(`🔥🔥🔥🔥🔥🔥🔥🔥🔥 ${data}`);
      this.file = this.file + data + " ";
    });
  }

  stopRecording() {
    this.socket.emit(
      "stop-recording",
      JSON.stringify({ recordingId: this.recordingId })
    );
    this.socket.on("recording-stopped", () => {
      console.log("Recording Stopped");
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
    console.log("==-- openAudioAsync --==");
    return this.mediaStream;
  }

  closeAudio = () => {
    if (this.mediaStream) {
      const audioTracks = this.mediaStream.getAudioTracks();
      audioTracks.forEach((track) => track.stop());
      this.mediaStream = null;

      console.log("==-- closeAudio --==");
    }
  };
}
