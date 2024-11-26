class AudioHandler {
    constructor() {
        this.audioContext = null;
        this.mediaStream = null;
        this.mediaRecorder = null;
        this.websocket = null;
        this.isRecording = false;
        this.chatbox = null;
        this.lastMessageId = null;
        this.sampleRate = 25000;
        this.onTranscriptReceived = this.handleTranscript.bind(this);
        this.onError = null;
        this.audioBufferQueue = [];
        this.isPlaying = false;
        this.recordedAudioChunks = [];
    }

    async initialize() {
        if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
            const error = new Error('Media devices not supported');
            if (this.onError) this.onError(error);
            return false;
        }

        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)({
                sampleRate: this.sampleRate,
            });
            this.mediaStream = await navigator.mediaDevices.getUserMedia({ audio: true });
            return true;
        } catch (error) {
            if (this.onError) this.onError(error);
            return false;
        }
    }

    async startRecording() {
        if (!this.audioContext || !this.mediaStream || this.isRecording) return;

        const connectWebSocket = () => {
            // const wsUrl = `ws://localhost:8001/audio_stream`;
            const wsUrl = `ws://206.81.19.236:8003/audio_stream`;
            this.websocket = new WebSocket(wsUrl);

            this.websocket.onopen = () => {
                console.log('WebSocket connection established');
                this.websocketStartTime = Date.now(); // Track connection start time
            };

            this.websocket.onerror = (error) => {
                console.error('WebSocket error:', error);
                this.stopRecording();
            };

            this.websocket.onclose = () => {
                console.log('WebSocket connection closed');
            };

            this.websocket.onmessage = this.handleWebSocketMessage.bind(this);
        };

        connectWebSocket();

        // Reconnect logic
        this.websocketReconnectInterval = setInterval(() => {
            const elapsedTime = (Date.now() - this.websocketStartTime) / 1000;
            if (elapsedTime > 15 * 60) { // 15 minutes in seconds
                console.log('Reconnecting WebSocket...');
                this.websocket.close();
                connectWebSocket();
            }
        }, 1000); // Check every second

        const source = this.audioContext.createMediaStreamSource(this.mediaStream);
        const processor = this.audioContext.createScriptProcessor(8192, 1, 1);

        processor.onaudioprocess = (e) => {
            if (this.isRecording && this.websocket?.readyState === WebSocket.OPEN) {
                const audioData = e.inputBuffer.getChannelData(0);
                const amplitude = this.calculateAmplitude(audioData);

                if (amplitude > 0.01) { // Threshold for speech (adjust based on testing)
                    console.log('User is speaking...');
                    this.sendAudioChunk(audioData);
                } else {
                    console.log('Silence detected...');
                }
            }
        };

        source.connect(processor);
        processor.connect(this.audioContext.destination);
        this.isRecording = true;
    }

    // Method to calculate audio amplitude
    calculateAmplitude(audioData) {
        let sum = 0;
        for (let i = 0; i < audioData.length; i++) {
            sum += audioData[i] * audioData[i];
        }
        return Math.sqrt(sum / audioData.length); // Root Mean Square (RMS) Amplitude
    }

    stopRecording() {
        this.isRecording = false;
        this.audioBufferQueue = [];
        // this.saveAudioToFile()

        if (this.websocketReconnectInterval) {
            clearInterval(this.websocketReconnectInterval);
        }
        if (this.websocket) this.websocket.close();
        if (this.mediaStream) this.mediaStream.getTracks().forEach(track => track.stop());
    }

    // Save audio data as a WAV file
    saveAudioToFile() {
        if (this.recordedAudioChunks.length === 0) {
            console.log("No audio recorded to save.");
            return;
        }

        const audioBuffer = this.concatFloat32Array(this.recordedAudioChunks);
        const wavBlob = this.encodeWAV(audioBuffer, this.sampleRate);
        const url = URL.createObjectURL(wavBlob);

        // Create a downloadable link
        const link = document.createElement("a");
        link.href = url;
        link.download = "recorded_audio.wav";
        link.click();
        console.log("Audio saved as recorded_audio.wav");
    }

    concatFloat32Array(chunks) {
        const totalLength = chunks.reduce((sum, arr) => sum + arr.length, 0);
        const result = new Float32Array(totalLength);
        let offset = 0;

        chunks.forEach((chunk) => {
            result.set(chunk, offset);
            offset += chunk.length;
        });

        return result;
    }

    encodeWAV(samples, sampleRate) {
        const buffer = new ArrayBuffer(44 + samples.length * 2);
        const view = new DataView(buffer);

        function writeString(view, offset, string) {
            for (let i = 0; i < string.length; i++) {
                view.setUint8(offset + i, string.charCodeAt(i));
            }
        }

        writeString(view, 0, "RIFF");
        view.setUint32(4, 36 + samples.length * 2, true);
        writeString(view, 8, "WAVE");
        writeString(view, 12, "fmt ");
        view.setUint32(16, 16, true);
        view.setUint16(20, 1, true);
        view.setUint16(22, 1, true);
        view.setUint32(24, sampleRate, true);
        view.setUint32(28, sampleRate * 2, true);
        view.setUint16(32, 2, true);
        view.setUint16(34, 16, true);
        writeString(view, 36, "data");
        view.setUint32(40, samples.length * 2, true);

        let offset = 44;
        for (let i = 0; i < samples.length; i++, offset += 2) {
            const s = Math.max(-1, Math.min(1, samples[i]));
            view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7FFF, true);
        }

        return new Blob([view], { type: "audio/wav" });
    }

    async sendAudioChunk(audioData) {
        if (!this.websocket || this.websocket.readyState !== WebSocket.OPEN) return;
        // Save chunk for testing
        const audioArray = Object.values(audioData);
        this.recordedAudioChunks.push(audioArray);
        // const base64Audio = this.float32ToBase64(audioArray);
        // this.websocket.send(JSON.stringify({ audio_bytes: base64Audio, sample_rate: this.sampleRate }));
        this.websocket.send(JSON.stringify({ audio_bytes: audioArray, sample_rate: this.sampleRate }));
    }

    handleWebSocketMessage(event) {
        try {
            const message = JSON.parse(event.data);

            if (message.id && message.id === this.lastMessageId) return;
            this.lastMessageId = message.id;

            if (message.audio) {
                const audioArray = this.base64ToFloat32(message.audio);
                this.playAudio(audioArray);
            }

            if (message.transcript) {
                this.onTranscriptReceived(message.transcript, message.new);
            }

            if (message.function_name && message.inputs) {
                processFunctionCalls([{
                    function_name: message.function_name,
                    inputs: message.inputs,
                }]);
            }

            if (message.error) {
                if (this.onError) this.onError(new Error(message.error));
            }
        } catch (error) {
            if (this.onError) this.onError(error);
        }
    }

    float32ToBase64(float32Array) {
        const pcm16Array = new Int16Array(float32Array.length);
        for (let i = 0; i < float32Array.length; i++) {
            pcm16Array[i] = Math.max(-32768, Math.min(32767, float32Array[i] * 32767));
        }
        const uint8Array = new Uint8Array(pcm16Array.buffer);
        return btoa(String.fromCharCode(...uint8Array));
    }

    base64ToFloat32(base64String) {
        const binaryString = atob(base64String);
        const uint8Array = new Uint8Array(binaryString.length);
        for (let i = 0; i < binaryString.length; i++) {
            uint8Array[i] = binaryString.charCodeAt(i);
        }
        const pcm16Array = new Int16Array(uint8Array.buffer);
        const float32Array = new Float32Array(pcm16Array.length);
        for (let i = 0; i < pcm16Array.length; i++) {
            float32Array[i] = pcm16Array[i] / 32768;
        }
        return float32Array;
    }

    async playAudio(audioData) {
        try {

            this.audioBufferQueue.push(audioData);


            if (this.isPlaying) return;

            this.isPlaying = true;

            while (this.audioBufferQueue.length > 0) {

                const nextChunk = this.audioBufferQueue.shift();


                const buffer = this.audioContext.createBuffer(1, nextChunk.length, this.sampleRate);
                buffer.copyToChannel(nextChunk, 0);


                const source = this.audioContext.createBufferSource();
                source.buffer = buffer;
                source.connect(this.audioContext.destination);

                const chunkDuration = buffer.duration;


                source.start();
                await this.sleep(chunkDuration * 1000);
            }


            this.isPlaying = false;
        } catch (error) {
            this.isPlaying = false;
            if (this.onError) this.onError(error);
        }
    }


    sleep(ms) {
        return new Promise((resolve) => setTimeout(resolve, ms));
    }

    handleTranscript(transcript, isNew = false) {
        if (!this.chatbox || isNew)
            this.chatbox = createBotMessageDiv();
        if (!transcript.trim()) return;

        this.chatbox.innerHTML += transcript;
        this.chatbox.scrollTop = this.chatbox.scrollHeight;
    }
}
