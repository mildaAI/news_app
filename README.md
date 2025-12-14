# Voice AI Newsletter Assistant

A real-time voice-based application that integrates with n8n to trigger newsletter workflows. It captures voice commands, processes them via an n8n agent, and provides immediate feedback on the newsletter generation status.

## Features

- 🎤 **Voice Input**: Uses Web Speech API to capture user commands.
- 📧 **Newsletter Trigger**: Direct integration with n8n to start newsletter generation workflows.
- 💬 **Smart Feedback**: 
  - "Newsletter will be sent soon" (Success)
  - "Not a news topic" (Validation failure)
  - "Something went wrong" (Error handling)
- 🔊 **Audio Broadcasting**: Supports receiving and playing async audio updates via WebSocket.
- 📱 **Responsive UI**: Clean, modern chat interface with loading states.

## Tech Stack

- **Backend**: Node.js with Express
- **Frontend**: Vanilla JavaScript, HTML, CSS
- **WebSocket**: Real-time communication for async updates
- **Integration**: n8n webhook-based AI agent

## Project Structure

```
voice_app/
├── server.js           # Express server with WebSocket support
├── package.json        # Dependencies and scripts
├── public/
│   ├── index.html      # Main HTML interface
│   ├── script.js       # Client-side JavaScript logic
│   └── style.css       # Styling
└── README.md           # This file
```

## Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd voice_app
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set environment variables**
   Create a `.env` file in the root directory (optional, defaults provided in code):
   ```
   N8N_WEBHOOK_URL=http://localhost:5678/webhook-test/start-newsletter
   PORT=3000
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open in browser**
   Navigate to `http://localhost:3000`

## Usage

1. **Click the microphone button** (🎤) to start recording.
2. **Speak your command** (e.g., "Send me a newsletter about AI trends").
3. **Wait for processing** - the app will send your text to n8n.
4. **Receive Feedback**:
   - If valid: You'll see "Newsletter will be sent soon".
   - If invalid: You'll see "Not a news topic".
5. **Async Updates**: If the n8n workflow generates an audio summary later, it will be played automatically via WebSocket.

## API Endpoints

### `/api/prompt` (POST)
Sends a text prompt to the n8n agent and receives a status message.

**Request:**
```json
{
  "text": "User's voice command as text"
}
```

**Response:**
```json
{
  "message": "newsletter will be sent soon" 
  // OR "Not a news topic" 
  // OR "something went wrong"
}
```

## Troubleshooting

### "Not a news topic"
- This means n8n returned the text "Failed". Check your n8n workflow logic to ensure it correctly identifies news topics.

### "Something went wrong"
- Check server logs for details.
- Ensure n8n is running and the webhook URL is correct.

## License

MIT
