import * as store from './store.js';

// utilitário para gravação de media

let mediaRecorder;

const vp9Codec = 'video/webm; codecs=vp=9';
const vp9Options = { mimeType: vp9Codec };
const recordedChunks = [];

export const startRecording = () => {
    const remoteStream = store.getState().remoteStream;

    // se a media de gravação suportar vp9codec
    if (MediaRecorder.isTypeSupported(vp9Codec)) {
        // inciamos um media recorder com a stream remota e as opções
        mediaRecorder = new MediaRecorder(remoteStream, vp9Options);
    }else{
        // se não, iniciamos default
        mediaRecorder = new MediaRecorder(remoteStream);
    }

    mediaRecorder.ondataavailable = handleDataAvailable;
    mediaRecorder.start();
};

// função para parar a gravação
export const pauseRecording = () => {
    mediaRecorder.pause();
}

// função para continuar a gravação
export const resumeRecording = () => {
    mediaRecorder.resume();
};

// função para parar a gravação
export const stopRecording = () => {
    mediaRecorder.stop();
};

const downloadRecordedVideo = () => {
    const blob = new Blob(recordedChunks, {
        type: 'video/webm'
    });

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    document.body.appendChild(a);
    a.style = 'display: none';
    a.href = url;
    a.download = 'recording.webm';
    a.click();
    window.URL.revokeObjectURL(url);
};

const handleDataAvailable = (event) => {
    if (event.data.size > 0) {
        recordedChunks.push(event.data);
        // fazendo o download do da gravação
        downloadRecordedVideo();
    }
};