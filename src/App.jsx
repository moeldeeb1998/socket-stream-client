import { useState } from "react";
import "./App.css";
import { Initializer } from "./service";
import RecordRTC, { StereoAudioRecorder } from "recordrtc";
import ss from "socket.io-stream";

const init = new Initializer();
let recorder;

const App = () => {
  const [recording, setRecording] = useState(false);

  const startHandler = async () => {
    try {
      setRecording(true);
      await init.openAudioAsync();
      recorder = new RecordRTC(init.getMediaStream(), {
        type: "audio",
        mimeType: "audio/webm",
        sampleRate: 44100,
        desiredSampRate: 16000,
        recorderType: StereoAudioRecorder,
        numberOfAudioChannels: 1,
        timeSlice: 2500,

        ondataavailable: (blob) => {
          console.log("data ");
          const stream = ss.createStream();
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
        init.socket.emit("message", dataToSend);
        init.closeAudio();
      });
    });
  };

  return (
    <div>
      <div>
        <button disabled={recording} onClick={startHandler}>
          start
        </button>
        <button disabled={!recording} onClick={stopHandler}>
          stop
        </button>
        {recording && <span>recording...</span>}
      </div>
      <div>content</div>
    </div>
  );
};

export default App;
