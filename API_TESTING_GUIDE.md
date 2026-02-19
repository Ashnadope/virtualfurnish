# OpenRouter API Integration Guide

## Current Setup

✅ **API Provider**: OpenRouter (Nvidia Nemotron)  
✅ **Model**: `nvidia/nemotron-nano-12b-v2-vl` (Vision-Language)  
✅ **Base URL**: `https://openrouter.ai/api/v1`  

---

## What Requests Are Being Sent

### 1. **Simple Text Completion** (Testing)
```javascript
// src/lib/testOpenaiClient.js
openai.chat.completions.create({
  model: 'nvidia/nemotron-nano-12b-v2-vl',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant.'
    },
    {
      role: 'user',
      content: 'Say "API is working!" in one sentence.'
    }
  ],
  max_tokens: 50
})
```

### 2. **Room Analysis** (Your Main Feature)
```javascript
// src/app/api/room-analysis/route.js
openai.chat.completions.create({
  model: 'nvidia/nemotron-nano-12b-v2-vl',
  messages: [
    {
      role: 'system',
      content: 'You are an expert interior designer AI...'
    },
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Analyze this room image and provide:\n1. Room type...\n2. Colors...\n...'
        },
        {
          type: 'image_url',
          image_url: {
            url: imageUrl  // User's uploaded room image
          }
        }
      ]
    }
  ],
  response_format: { type: 'json_object' },
  max_tokens: 2000
})
```

---

## How to Test

### Option 1: Test API Only
```bash
# In PowerShell, set the API key and run:
$env:OPENAI_API_KEY = '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'
node src/lib/testOpenaiClient.js
```

### Option 2: Test Full Room Analysis Endpoint
```bash
# Start your Next.js dev server
npm run dev

# In another terminal, test the API:
curl -X POST http://localhost:3000/api/room-analysis \
  -H "Content-Type: application/json" \
  -d '{
    "imageUrl": "https://images.unsplash.com/photo-1634497885778-152eb6fd543d",
    "furnitureData": [
      {
        "id": "1",
        "name": "Modern Sofa",
        "category": "Living Room",
        "material": "Fabric",
        "dimensions": "2000x900x800",
        "price": 24999
      }
    ]
  }'
```

### Option 3: Test via UI
1. Go to `http://localhost:3000/virtual-room-designer`
2. Upload or paste a room image URL
3. Submit for analysis
4. Check browser DevTools → Network tab to see the request

---

## API Request Structure

### Headers
```
Content-Type: application/json
Authorization: Bearer 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
```

### Request Body Example
```json
{
  "model": "nvidia/nemotron-nano-12b-v2-vl",
  "messages": [
    {
      "role": "system",
      "content": "You are an expert interior designer..."
    },
    {
      "role": "user",
      "content": [
        {
          "type": "text",
          "text": "Analyze this room image..."
        },
        {
          "type": "image_url",
          "image_url": {
            "url": "https://example.com/room.jpg"
          }
        }
      ]
    }
  ],
  "response_format": {
    "type": "json_object"
  },
  "max_tokens": 2000
}
```

### Success Response
```json
{
  "success": true,
  "analysis": {
    "roomAnalysis": {
      "roomType": "Living Room",
      "estimatedDimensions": "15ft x 20ft",
      "dominantColors": ["Beige", "Brown", "White"],
      "style": "Modern Minimalist",
      "lighting": "Natural light from 2 windows"
    },
    "furnitureRecommendations": [
      {
        "furnitureId": "1",
        "reason": "Complements the neutral color scheme...",
        "colorMatch": "Grey fabric matches walls...",
        "placementSuggestion": "Center of the room...",
        "priority": "high"
      }
    ],
    "layoutSuggestions": [...],
    "colorPaletteSuggestions": {...}
  }
}
```

### Error Response
```json
{
  "success": false,
  "error": "Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.",
  "details": "error message from API"
}
```

---

## Important Notes

⚠️ **Nemotron vs GPT-4o Differences**:

| Feature | GPT-4o | Nemotron |
|---------|--------|----------|
| Image Analysis | ✅ Excellent | ⚠️ Basic |
| Reasoning | ✅ Advanced | ⚠️ Limited |
| JSON Format | ✅ Reliable | ⚠️ May need retries |
| Cost | More expensive | FREE tier available |
| Speed | Slower | Faster |

**Recommendation**: Use Nemotron for **development & testing**. Plan to migrate to GPT-4o when in production.

---

## Troubleshooting

### "Invalid API Key"
- Check your API key starts with `sk-or-v1-`
- Verify it's set in `.env` file
- Don't wrap API key in quotes when setting via PowerShell

### "Model Not Found"
- Ensure you're using the exact model name: `nvidia/nemotron-nano-12b-v2-vl`
- Check OpenRouter supports this model (it should)

### "Rate Limited (429)"
- Free tier has limited requests
- Wait before retrying
- Consider upgrading for production

### Inconsistent JSON Responses
- Nemotron is smaller than GPT-4o, so responses may vary
- Add error handling for malformed JSON
- Retry with stricter prompts

---

## How to Switch Back to GPT-4o

Simply change your API key in `.env`:
```
OPENAI_API_KEY=sk-proj-your-openai-key...
```

The client will automatically detect it's OpenAI and use the correct endpoint + model.
