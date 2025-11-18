# Gemini API Setup Guide

## Setting Up Gemini API Key

### For Firebase Functions (Backend)

You need to set the `GEMINI_API_KEY` environment variable in Firebase Functions. There are two ways to do this:

#### Option 1: Using Firebase Console (Recommended)
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Navigate to **Functions** > **Configuration** > **Environment Variables**
4. Click **Add Variable**
5. Set:
   - **Name**: `GEMINI_API_KEY`
   - **Value**: Your Gemini API key
6. Click **Save**
7. Redeploy your functions: `firebase deploy --only functions`

#### Option 2: Using Firebase CLI
```bash
# Set the secret (recommended for sensitive data)
firebase functions:secrets:set GEMINI_API_KEY

# Or set as environment variable (for v2 functions)
firebase functions:config:set gemini.api_key="your_api_key_here"
```

### For React Native (Frontend - Optional)

If you need to use the API key in the React Native app (not recommended for security), add it to your `.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key_here
```

**Note**: It's better to keep API keys on the backend (Firebase Functions) for security.

## Getting Your Gemini API Key

1. Go to [Google AI Studio](https://makersuite.google.com/app/apikey)
2. Sign in with your Google account
3. Click **Create API Key**
4. Copy the API key

## Model Information

The project is configured to use **Gemini 2.0 Flash Experimental** (`gemini-2.0-flash-exp`), which is the latest Flash model from Google.

To change the model, edit `functions/index.js`:
```javascript
const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash-exp' });
```

Available models:
- `gemini-2.0-flash-exp` - Latest experimental Flash model (current)
- `gemini-1.5-flash` - Stable Flash model
- `gemini-1.5-pro` - Pro model (slower but more capable)

## Testing

After setting up the API key, test the function:
```bash
# View logs
firebase functions:log

# Test locally (if using emulator)
firebase emulators:start --only functions
```

## Console Logs

The project includes extensive console logging for debugging:
- **Frontend**: Check React Native debugger or Metro bundler console
- **Backend**: Check Firebase Functions logs using `firebase functions:log`

