// The Netlify function handler that runs after a form submission
exports.handler = async (event) => {
    // 1. Get the Google Chat Webhook URL from environment variables
    const GOOGLE_CHAT_URL = process.env.GOOGLE_CHAT_WEBHOOK_URL;

    // A. Netlify's event body is a URL-encoded string, which needs to be parsed.
    // However, for Form-triggered functions, Netlify passes a JSON payload 
    // that contains a 'payload' object with the form data.
    const netlifyPayload = JSON.parse(event.body);
    const formData = netlifyPayload.payload.data;
    const formName = netlifyPayload.payload.form_name;

    // 2. Format the Message for Google Chat (Simple Text Message)
    let chatMessage = `New Form Submission: **${formName}**\n\n`;

    // Loop through all form fields and append them to the message
    for (const [key, value] of Object.entries(formData)) {
        // Skip hidden Netlify fields
        if (key.startsWith('g-recaptcha') || key.startsWith('form-name')) continue;
        
        // Basic Markdown formatting for Google Chat
        chatMessage += `*${key}:* ${value}\n`;
    }

    // Google Chat's expected JSON payload structure for a simple message
    const googleChatPayload = {
        text: chatMessage,
    };

    // 3. Send the POST request to the Google Chat Webhook URL
    try {
        const response = await fetch(GOOGLE_CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json; charset=UTF-8',
            },
            body: JSON.stringify(googleChatPayload),
        });

        // Handle errors from Google Chat's side
        if (response.status !== 200) {
            console.error('Google Chat Webhook failed:', response.status, response.statusText);
            return {
                statusCode: 500,
                body: 'Error forwarding to Google Chat',
            };
        }

        console.log('Successfully forwarded submission to Google Chat.');
        
        // This function must return a response object, even if the action is successful
        return {
            statusCode: 200,
            body: 'Form submission forwarded successfully',
        };

    } catch (error) {
        console.error('Network or Fetch Error:', error);
        return {
            statusCode: 500,
            body: `Internal Server Error: ${error.message}`,
        };
    }
};