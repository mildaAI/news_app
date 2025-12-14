const recordBtn = document.getElementById('record-btn');
const chatBox = document.getElementById('chat-box');

// --- Speech Recognition Setup ---
const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
let recognition;

if (SpeechRecognition) {
    recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.lang = 'en-US';
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onstart = () => {
        recordBtn.textContent = '...';
        recordBtn.classList.add('is-recording');
    };

    recognition.onend = () => {
        recordBtn.textContent = '🎤';
        recordBtn.classList.remove('is-recording');
    };

    recognition.onresult = (event) => {
        const userPrompt = event.results[0][0].transcript;
        addMessageToChat(userPrompt, 'user');
        sendPromptToServer(userPrompt);
    };

    recognition.onerror = (event) => {
        console.error('Speech recognition error:', event.error);
        addMessageToChat(`Error: ${event.error}`, 'ai');
    };

} else {
    console.error('Speech Recognition not supported in this browser.');
    recordBtn.disabled = true;
    recordBtn.textContent = '❌';
    addMessageToChat('Sorry, your browser does not support speech recognition.', 'ai');
}

recordBtn.addEventListener('click', () => {
    // If not recording, start recognition.
    if (recognition && !recordBtn.classList.contains('is-recording')) {        
        recognition.start();
    }
});

// --- Helper Functions ---

function addMessageToChat(text, sender) {
    const messageElement = document.createElement('div');
    messageElement.classList.add('message', `${sender}-message`);
    messageElement.textContent = text;
    chatBox.appendChild(messageElement);
    chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll to the latest message
    return messageElement;
}

function showThinkingIndicator() {
    const thinkingElement = addMessageToChat('...', 'ai');
    thinkingElement.id = 'thinking-message'; // Give it an ID to find and remove it later
    // Optional: Add a class for styling the dots (e.g., with an animation)
    // thinkingElement.classList.add('thinking'); 
}

async function sendPromptToServer(text) {
    // Show the thinking indicator and spinner
    showThinkingIndicator();
    const spinner = document.getElementById('spinner');
    spinner.classList.remove('hidden');
    
    try {
        const response = await fetch('/api/prompt', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ text }),
        });

        const data = await response.json();
        
        // Hide spinner and remove the thinking indicator
        spinner.classList.add('hidden');
        const thinkingMessage = document.getElementById('thinking-message');
        if (thinkingMessage) thinkingMessage.remove();

        if (!response.ok) {
            const errorMsg = data.message || data.error || 'Unknown error';
            addMessageToChat(errorMsg, 'ai');
            return;
        }
        
        if (data.message) {
            addMessageToChat(data.message, 'ai');
        }

    } catch (error) {
        console.error('Error sending prompt to server:', error);
        spinner.classList.add('hidden');
        const thinkingMessage = document.getElementById('thinking-message');
        if (thinkingMessage) thinkingMessage.remove();
        addMessageToChat('Could not send your message to the server.', 'ai');
    }
}

