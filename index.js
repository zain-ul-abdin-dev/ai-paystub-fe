const audioHandler = new AudioHandler();
let isVoiceModeActive = false;

document.addEventListener('DOMContentLoaded', () => {
  const chatForm = document.getElementById('chatForm');
  const voiceBtn = document.getElementById('voiceBtn');

  if (chatForm) chatForm.addEventListener('submit', handleTextSubmit);
  if (voiceBtn) voiceBtn.addEventListener('click', handleVoiceButton);

  // Initialize audio handler
  audioHandler.onError = handleAudioError;
});

function handleAudioError(error) {
  audioHandler.saveAudioToFile()
  console.error('Audio Error:', error);
  const chatbox = document.getElementById('chatbox');

  if (chatbox) {
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('bot-message', 'error');
    errorMessage.innerHTML = `Error: ${error.message}`;
    chatbox.appendChild(errorMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }

  // Reset voice mode if active
  if (isVoiceModeActive) {
    resetVoiceMode();
  }
}

async function handleTextSubmit(event) {
  event.preventDefault();
  if (isVoiceModeActive) return;

  const userInput = document.getElementById('userInput');
  if (!userInput || !userInput.value.trim()) return;

  await sendMessage(userInput.value);
}

async function handleVoiceButton() {
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceIndicator = document.getElementById('voiceIndicator');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!voiceBtn || !voiceIndicator || !userInput || !sendBtn) return;

  if (!isVoiceModeActive) {
    // Request microphone permission and start recording
    try {
      const hasPermission = await audioHandler.initialize();
      if (!hasPermission) {
        throw new Error('Could not access microphone');
      }

      isVoiceModeActive = true;
      voiceBtn.innerHTML = '<i class="fas fa-times"></i>';
      voiceBtn.classList.add('recording');
      voiceIndicator.classList.remove('hidden');
      userInput.classList.add('hidden');
      sendBtn.classList.add('hidden');

      await audioHandler.startRecording();
    } catch (error) {
      handleAudioError(error);
      handleAudioError(error);
      resetVoiceMode();
    }
  } else {
    resetVoiceMode();
  }
}

function resetVoiceMode() {
  const voiceBtn = document.getElementById('voiceBtn');
  const voiceIndicator = document.getElementById('voiceIndicator');
  const userInput = document.getElementById('userInput');
  const sendBtn = document.getElementById('sendBtn');

  if (!voiceBtn || !voiceIndicator || !userInput || !sendBtn) return;

  isVoiceModeActive = false;
  voiceBtn.innerHTML = '<i class="fas fa-microphone"></i>';
  voiceBtn.classList.remove('recording');
  voiceIndicator.classList.add('hidden');
  userInput.classList.remove('hidden');
  sendBtn.classList.remove('hidden');

  audioHandler.stopRecording();
}

async function sendMessage(message) {
  const chatbox = document.getElementById('chatbox');
  if (!chatbox || !message.trim()) return;

  // Display user message
  const userMessage = document.createElement('div');
  userMessage.classList.add('user-message');
  userMessage.innerHTML = message;
  chatbox.appendChild(userMessage);
  chatbox.scrollTop = chatbox.scrollHeight;

  // Clear input field
  const userInput = document.getElementById('userInput');
  if (userInput) userInput.value = '';

  try {
    const response = await fetch('http://206.81.19.236:8001/stream/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: message, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      // const responseData = await response.json();
      // handleResponse(responseData);
    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      let done = false;
      let accumulatedText = '';
      let currentMessageDiv = null;
      let isFunctionCallActive = false;
      let functionCallText = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;

        if (value) {
          const chunk = decoder.decode(value, { stream: true });
          accumulatedText += chunk;

          while (accumulatedText.length > 0) {
            if (!isFunctionCallActive) {
              const startIndex = accumulatedText.indexOf('```FUNCTION_CALL_START');

              if (startIndex === -1) {
                if (!currentMessageDiv) {
                  currentMessageDiv = createBotMessageDiv();
                }
                currentMessageDiv.innerHTML = accumulatedText;
                break;
              } else {
                const beforeText = accumulatedText.substring(0, startIndex).trim();
                if (beforeText) {
                  if (!currentMessageDiv) {
                    currentMessageDiv = createBotMessageDiv();
                  }
                  currentMessageDiv.innerHTML = beforeText;
                }

                accumulatedText = accumulatedText.substring(startIndex + '```FUNCTION_CALL_START'.length);
                isFunctionCallActive = true;
                functionCallText = '';
              }
            } else {
              const endIndex = accumulatedText.indexOf('```FUNCTION_CALL_END');

              if (endIndex === -1) {
                functionCallText += accumulatedText;
                accumulatedText = '';
                break;
              } else {
                functionCallText += accumulatedText.substring(0, endIndex);

                try {
                  const functionCalls = JSON.parse(functionCallText.trim());
                  processFunctionCalls(functionCalls);
                } catch (error) {
                  console.error('Error processing function call:', error);
                }

                isFunctionCallActive = false;
                functionCallText = '';

                const afterText = accumulatedText.substring(endIndex + '```FUNCTION_CALL_END'.length).trim();

                if (afterText) {
                  currentMessageDiv = createBotMessageDiv();
                  currentMessageDiv.innerHTML = afterText;
                }

                accumulatedText = accumulatedText.substring(endIndex + '```FUNCTION_CALL_END'.length);
              }
            }
          }
        }

        chatbox.scrollTop = chatbox.scrollHeight;
      }
    }
  } catch (error) {
    console.error('Error:', error);
    const errorMessage = document.createElement('div');
    errorMessage.classList.add('bot-message', 'error');
    errorMessage.innerHTML = `Error: ${error.message}`;
    chatbox.appendChild(errorMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
}

function createBotMessageDiv() {
  const div = document.createElement('div');
  div.classList.add('bot-message');
  const chatbox = document.getElementById('chatbox');
  if (chatbox) chatbox.appendChild(div);
  return div;
}

function processFunctionCalls(functionCalls) {
  if (!Array.isArray(functionCalls)) return;

  functionCalls.forEach(call => {
    const { function_name, inputs } = call;
    if (!function_name) return;

    try {
      const inputsObj = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
      if (typeof paystubaiintegration !== 'undefined' && function_name in paystubaiintegration) {
        paystubaiintegration[function_name](inputsObj);
      } else {
        console.log(`Function "${function_name}" not found`);
      }
    } catch (error) {
      console.error('Error processing function call:', error);
    }
  });
}
