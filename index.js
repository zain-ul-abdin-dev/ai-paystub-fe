const sessionId = generateSessionId();
document.getElementById('chatForm').addEventListener('submit', async (event) => {
  event.preventDefault();

  const userInput = document.getElementById('userInput').value;
  const chatbox = document.getElementById('chatbox');
 
  // Display user message
  const userMessage = document.createElement('div');
  userMessage.classList.add('user-message');
  userMessage.textContent = userInput;
  chatbox.appendChild(userMessage);
  chatbox.scrollTop = chatbox.scrollHeight;

  // Clear input field
  document.getElementById('userInput').value = '';

  try {
    const response = await fetch('http://127.0.0.1:8001/stream/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userInput, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    const contentType = response.headers.get('Content-Type');
    if (contentType && contentType.includes('application/json')) {
      const responseData = await response.json();
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
                currentMessageDiv.textContent = accumulatedText;
                break;
              } else {
                const beforeText = accumulatedText.substring(0, startIndex).trim();
                if (beforeText) {
                  if (!currentMessageDiv) {
                    currentMessageDiv = createBotMessageDiv();
                  }
                  currentMessageDiv.textContent = beforeText;
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
                  currentMessageDiv.textContent = afterText;
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
    errorMessage.classList.add('bot-message');
    errorMessage.textContent = `Error: ${error.message}`;
    chatbox.appendChild(errorMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
  }
});

// Helper function to create a new bot message div
function createBotMessageDiv() {
  const div = document.createElement('div');
  div.classList.add('bot-message');
  document.getElementById('chatbox').appendChild(div);
  return div;
}

// Function to process the function calls
function processFunctionCalls(functionCalls) {
  functionCalls.forEach(call => {
    const { function_name, inputs } = call;
    // Parse the inputs string to object if needed
    const inputsObj = typeof inputs === 'string' ? JSON.parse(inputs) : inputs;
    if (function_name in paystubaiintegration) {
      paystubaiintegration[function_name](inputsObj)
    } else {
      console.log("No function Found!")
    }
  });
}

// Function to generate a session ID
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 10);
}
