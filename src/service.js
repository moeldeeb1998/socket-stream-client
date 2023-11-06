import { io } from "socket.io-client";

export class Initializer {
  mediaStream = null;
  socket = null;
  recordingId = null;
  file = "";
  error = "";

  constructor() {
    this.socket = io("ws://192.168.1.168:5000", {
      path: "/sockets",
      transports: ["websocket"],
    });
    this.handleEvents();
    localStorage.setItem(
      "token",
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJodHRwOi8vc2NoZW1hcy54bWxzb2FwLm9yZy93cy8yMDA1LzA1L2lkZW50aXR5L2NsYWltcy9uYW1laWRlbnRpZmllciI6IjdmOTU0NTJmLWI3YzItNGE3Ny1iMWExLWNmYzE5YmM1NzcyYyIsIklzQWNjb3VudEFwcHJvdmVkIjoiVHJ1ZSIsIk93bmVkQWNjb3VudElkIjoiYTIwYWIzY2YtNjhkZi00MTY4LWIwZWQtMmQ4OWJjMjU4ZTdiIiwiZXhwIjoxNzAwOTkwMTMzLCJpc3MiOiJJVm9pY2UiLCJhdWQiOiJJVm9pY2UifQ.I66Bm8X-P12HOsBsgVqA0tsjYmpvR7RZ5I_8sR7i_Dw"
    );
    localStorage.setItem("refresh_token", "SZE8IlTRS0mSUzaoqnYddg==");
    localStorage.setItem("accountId", "a20ab3cf-68df-4168-b0ed-2d89bc258e7b");
  }

  handleEvents() {
    console.log(`🔥: ${this.socket.id} user is connected`);
    this.socket.on("disconnect", () => {
      console.log("🔥: A user disconnected");
    });
  }

  startRecording() {
    if (
      localStorage.getItem("token") &&
      localStorage.getItem("refresh_token")
    ) {
      this.socket.emit(
        "start-recording",
        JSON.stringify({
          token: localStorage.getItem("token"),
          refresh_token: localStorage.getItem("refresh_token"),
        })
      );
    }

    this.socket.on("recording-started", (data) => {
      try {
        console.log(`🎙️: user sends start recording2 : ${data}`);
        console.log(JSON.parse(data).recordingId);
        this.recordingId = JSON.parse(data).recordingId;
      } catch (error) {
        console.log("Recording started ON Error", error);
      }
    });

    this.socket.on("error", (data) => {
      this.recordingId = null;
      if (data) this.error = JSON.parse(data).message;
    });
  }

  sendChunks(chunk) {
    if (this.recordingId && chunk) {
      this.socket.emit(
        "recording-chunk",
        JSON.stringify({
          recordingId: this.recordingId,
          data: chunk,
        })
      );
      this.socket.on("chunk-result", (data) => {
        try {
          console.log(`🔥🔥🔥🔥🔥🔥🔥🔥🔥 ${data}`);
          this.file = data.trim() === "" ? "😂" : data + " ";
        } catch (error) {
          console.log("Chunk Result Error", error);
        }
      });
    }
    this.socket.on("error", (data) => {
      this.recordingId = null;
      if (data) this.error = JSON.parse(data).message;
    });
  }

  stopRecording() {
    if (
      this.recordingId &&
      localStorage.getItem("token") &&
      localStorage.getItem("refresh_token") &&
      localStorage.getItem("accountId")
    ) {
      this.socket.emit(
        "stop-recording",
        JSON.stringify({
          recordingId: this.recordingId,
          token: localStorage.getItem("token"),
          refresh_token: localStorage.getItem("refresh_token"),
          accountId: localStorage.getItem("accountId"),
        })
      );
    }
    this.socket.on("recording-stopped", () => {
      this.recordingId = null;
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
