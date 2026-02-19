import OpenAI from 'openai';

/**
 * Initializes the OpenAI client with the API key from environment variables.
 * Supports both OpenAI and OpenRouter API keys.
 * Validates API key existence before creating client instance.
 * @returns {OpenAI|null} Configured OpenAI client instance or null if API key is missing.
 */
let openai = null;

try {
  if (process.env.OPENAI_API_KEY) {
    const apiKey = process.env.OPENAI_API_KEY;
    const isOpenRouter = apiKey?.startsWith('sk-or-v1-');
    
    const config = {
      apiKey: apiKey,
    };

    // Set OpenRouter base URL if using OpenRouter API key
    if (isOpenRouter) {
      config.baseURL = 'https://openrouter.ai/api/v1';
      console.log('✓ OpenRouter API detected - using OpenRouter endpoints');
    } else {
      console.log('✓ OpenAI API detected - using OpenAI endpoints');
    }

    openai = new OpenAI(config);
  } else {
    console.warn('⚠️ OPENAI_API_KEY environment variable is not set. OpenAI features will be disabled.');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error);
  openai = null;
}

export default openai;