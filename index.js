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
    const response = await fetch('http://68.183.69.16:8001/stream/text', {
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

    if (contentType && contentType.includes('application/json')) {
      responseData = await response.json(); // Parse as JSON
    } else {
      responseData = await response.text(); // Parse as plain text
    }

    console.log('API Response:', responseData);

    // Display bot response
    const botMessage = document.createElement('div');
    botMessage.classList.add('bot-message');

    // Handle plain text or JSON response
    botMessage.textContent =
      typeof responseData === 'string'
        ? responseData // Plain text response
        : responseData.response || 'No valid response received from API.'; // JSON response
    chatbox.appendChild(botMessage);
    chatbox.scrollTop = chatbox.scrollHeight;
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