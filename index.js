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
    // Send API request
    const response = await fetch('https://formfilling-backen-ai-823410206404.us-central1.run.app/stream/text', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ query: userInput, session_id: sessionId }),
    });

    if (!response.ok) {
      throw new Error(`API Error: ${response.status} ${response.statusText}`);
    }

    // Check if the response is JSON or plain text
    const contentType = response.headers.get('Content-Type');
    let responseData;
    const botMessage = document.createElement('div');
    botMessage.classList.add('bot-message'); // Handle plain text or JSON response
    showBotReponse("...");
    chatbox.appendChild(botMessage);
    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json(); // Parse as JSON
      showBotReponse('No valid response received from API.')
    } else {
      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let done = false;
      let text = '';

      while (!done) {
        const { value, done: readerDone } = await reader.read();
        done = readerDone;
        text += decoder.decode(value, { stream: true });
        showBotReponse(text);
      }

      showBotReponse(text);
    }

    function showBotReponse(text) {
      botMessage.textContent = text;
      chatbox.scrollTop = chatbox.scrollHeight;
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

// Function to generate a session ID
function generateSessionId() {
  return 'session_' + Math.random().toString(36).substring(2, 10);
}
