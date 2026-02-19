/**
 * Test utility for OpenAI/OpenRouter API connectivity
 * Run with: node src/lib/testOpenaiClient.js (requires .env loaded)
 */

import openai from './openaiClient.js';

async function testAPIConnection() {
  console.log('\n📋 Testing OpenAI/OpenRouter API Connection\n');
  console.log('━'.repeat(50));

  if (!openai) {
    console.error('❌ OpenAI client failed to initialize');
    return false;
  }

  const apiKey = process.env.OPENAI_API_KEY;
  const isOpenRouter = apiKey?.startsWith('sk-or-v1-');
  
  console.log(`\n🔑 API Provider: ${isOpenRouter ? 'OpenRouter' : 'OpenAI'}`);
  console.log(`🔑 API Key: ${apiKey?.substring(0, 20)}...${apiKey?.substring(-8)}`);
  console.log(`📡 Base URL: ${isOpenRouter ? 'https://openrouter.ai/api/v1' : 'https://api.openai.com/v1'}`);
  
  const model = isOpenRouter ? 'nvidia/nemotron-nano-12b-v2-vl' : 'gpt-4o';
  console.log(`🤖 Model: ${model}`);

  try {
    console.log('\n⏳ Sending test request...\n');
    
    const response = await openai.chat.completions.create({
      model: model,
      messages: [
        {
          role: 'system',
          content: 'You are a helpful assistant. Respond briefly and concisely.'
        },
        {
          role: 'user',
          content: 'Say "API is working!" in one sentence.'
        }
      ],
      max_tokens: 50
    });

    const message = response.choices[0].message.content;
    console.log('✅ API Connection Successful!\n');
    console.log(`📝 Response: "${message}"`);
    console.log(`\n📊 Usage:`);
    console.log(`   Input tokens: ${response.usage.prompt_tokens}`);
    console.log(`   Output tokens: ${response.usage.completion_tokens}`);
    console.log(`   Total tokens: ${response.usage.total_tokens}`);
    console.log('\n✅ Your API is properly configured!\n');
    
    return true;
  } catch (error) {
    console.error('\n❌ API Connection Failed\n');
    console.error(`Error: ${error.message}`);
    
    if (error.status === 401 || error.code === 'invalid_api_key') {
      console.error('⚠️  Invalid API key. Check your OPENAI_API_KEY in .env');
    } else if (error.status === 429) {
      console.error('⚠️  Rate limited. Try again in a few moments.');
    } else if (error.code === 'model_not_found') {
      console.error(`⚠️  Model not found. The model "${model}" may not be available.`);
    }
    
    return false;
  }
}

// Run test
testAPIConnection().then(success => {
  process.exit(success ? 0 : 1);
});
