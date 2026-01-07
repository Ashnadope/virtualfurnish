import OpenAI from 'openai';

/**
 * Initializes the OpenAI client with the API key from environment variables.
 * Validates API key existence before creating client instance.
 * @returns {OpenAI|null} Configured OpenAI client instance or null if API key is missing.
 */
let openai = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
  } else {
    console.warn('⚠️ OPENAI_API_KEY environment variable is not set. OpenAI features will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error);
  openai = null;
}

export default openai;