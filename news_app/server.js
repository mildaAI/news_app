const express = require('express');
const path = require('path');
const cors = require('cors');
const axios = require('axios');

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

/**
 * Diagnostic root endpoint. If you see this message in the browser,
 * it means the server is running but there might be an issue with static file serving.
 */
app.get('/', (req, res) => {
  res.send('Server is running. If you see this, check that your `public` folder contains index.html.');
});

// IMPORTANT: Replace with your actual n8n webhook URL
// Using the Production URL is recommended so you don't have to "Listen for Test Event" each time.
const N8N_AGENT_WEBHOOK_URL = process.env.N8N_WEBHOOK_URL || 'http://localhost:5678/webhook-test/start-newsletter';

/**
 * Endpoint to receive prompt from the frontend,
 * then trigger the n8n agent webhook.
 */
app.post('/api/prompt', async (req, res) => {
    const { text } = req.body;
    if (!text) {
        console.log(`Received no text`);

        return res.status(400).json({ error: 'Text is required' });
    }

    console.log(`Received prompt: "${text}". Forwarding to n8n...`);

    try {
        // Always expect text data from n8n, regardless of HTTP status
        const response = await axios.post(N8N_AGENT_WEBHOOK_URL, { text }, { responseType: 'text', validateStatus: () => true });
        console.log('--- PROMPT FORWARDED TO N8N ---');

        const responseText = typeof response.data === 'string' ? response.data.trim() : '';

        // Check if the response is exactly 'Failed'
        if (responseText === 'Failed') {
            console.log('n8n returned Failed');
            return res.status(200).json({ message: 'Not a news topic' });
        }

        if (response.status === 200) {
            // Otherwise, print success message
            console.log('newsletter will be sent soon');
            return res.status(200).json({ message: 'newsletter will be sent soon' });
        }

        // All other responses
        console.log('Something went wrong with n8n response');
        return res.status(200).json({ message: 'something went wrong' });
    } catch (error) {
        console.error('--- ERROR FORWARDING PROMPT TO N8N ---');
        if (error.response && typeof error.response === 'object') {
            // The request was made and the server responded with a status code that falls out of the range of 2xx
            if (typeof error.response.data !== 'undefined') {
                console.error('Data:', error.response.data);
            } else {
                console.error('Data: <no data>');
            }
            if (typeof error.response.status !== 'undefined') {
                console.error('Status:', error.response.status);
            } else {
                console.error('Status: <no status>');
            }
        } else if (error.request) {
            // The request was made but no response was received (e.g., n8n is not running)
            console.error('No response received from n8n. Is the n8n application running?');
        } else {
            // Something happened in setting up the request that triggered an Error
            console.error('Error:', error.message);
        }
        console.error('-----------------------------------------');
        res.status(500).json({ error: 'Failed to forward prompt to n8n' });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
