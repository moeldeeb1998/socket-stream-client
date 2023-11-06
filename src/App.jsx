import React, { useState } from "react";
import "./App.css";
import { Initializer } from "./service";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import ss from "socket.io-stream";
import toWav from "audiobuffer-to-wav";

const init = new Initializer();
let recorder;

const App = () => {
  const [recording, setRecording] = useState(false);
  const convertBlobToBase64 = (blob) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(blob);
      reader.onloadend = () => {
        const base64data = reader.result.split(",")[1];
        resolve(base64data);
      };
      reader.onerror = (error) => reject(error);
    });
  };
  const startHandler = async () => {
    try {
      setRecording(true);
      await init.openAudioAsync();
      init.startRecording();
      recorder = new RecordRTC(init.getMediaStream(), {
        type: "audio",
        mimeType: "audio/webm",
        sampleRate: 44100,
        desiredSampRate: 16000,
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        timeSlice: 3000,
        ondataavailable: async (blob) => {
          console.log("data ", blob);
          const stream = ss.createStream();
          const audioData = await blob.arrayBuffer();
          const audioContext = new AudioContext();
          const audioBuffer = await audioContext.decodeAudioData(audioData);
          const wavData = toWav(audioBuffer);
          const wavBlob = new Blob([wavData], { type: "audio/wav" });
          const base64data = await convertBlobToBase64(wavBlob);
          blob && setRecord(base64data);
          ss(init.socket).emit("stream", stream, {
            name: "stream.wav",
            size: blob.size,
          });
          ss.createBlobReadStream(blob).pipe(stream);
        },
      });
      recorder.startRecording();
    } catch (err) {
      setRecording(false);
      console.log(`[ERROR]: ${err.message}`);
    }
  };

  const stopHandler = async () => {
    setRecording(false);
    recorder.stopRecording(() => {
      recorder.getDataURL((audioDataURL) => {
        let dataToSend = {
          audio: {
            type: recorder.getBlob().type || "audio/wav",
            dataURL: audioDataURL,
          },
        };
        init.stopRecording();
        init.socket.emit("message", dataToSend);
        init.closeAudio();
      });
    });
  };

  const [content, setContent] = React.useState("");
  const [record, setRecord] = React.useState();
  const handleChunks = (chunk) => {
    chunk && init.sendChunks(chunk);
  };
  React.useEffect(() => {
    console.log("❤️❤️❤️❤️❤️❤️❤️", init.file);
    setContent((prev) => prev + init.file);
  }, [init.file]);

  React.useEffect(() => {
    handleChunks(record);
  }, [record]);
  React.useEffect(() => {
    console.log(`🔥🔥🔥🔥🔥🔥🔥🔥🔥 ${content}`);
  }, [content]);
  React.useEffect(() => {
    if (init?.error) stopHandler();
  }, [init?.error]);
  return (
    <div>
      <div>
        {this?.error && this.error}
        <button disabled={recording} onClick={startHandler}>
          start
        </button>
        <button disabled={!recording} onClick={stopHandler}>
          stop
        </button>
        {recording && <span>recording...</span>}
      </div>
      <div>{content}</div>
    </div>
  );
};

export default App;
