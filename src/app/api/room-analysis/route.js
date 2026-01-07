import { NextResponse } from 'next/server';
import openai from '@/lib/openaiClient';

/**
 * POST /api/room-analysis
 * Analyzes uploaded room image for colors, style, and furniture recommendations
 */
export async function POST(request) {
  try {
    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      return NextResponse?.json(
        { 
          error: 'OpenAI API key is not configured. Please add OPENAI_API_KEY to your environment variables.',
          success: false 
        },
        { status: 500 }
      );
    }

    const { imageUrl, furnitureData } = await request?.json();

    if (!imageUrl) {
      return NextResponse?.json(
        { error: 'Image URL is required', success: false },
        { status: 400 }
      );
    }

    // Create furniture catalog summary for AI context
    const furnitureCatalog = furnitureData?.map(item => ({
      id: item?.id,
      name: item?.name,
      category: item?.category,
      material: item?.material,
      dimensions: item?.dimensions,
      price: item?.price
    }));

    const response = await openai?.chat?.completions?.create({
      model: 'gpt-4o',
      messages: [
        {
          role: 'system',
          content: 'You are an expert interior designer AI for VirtualFurnish. Analyze room images and provide detailed recommendations for furniture placement, color coordination, and style matching. You have access to a furniture catalog and should recommend specific pieces that match the room\'s aesthetic.'
        },
        {
          role: 'user',
          content: [
            {
              type: 'text',
              text: 'Analyze this room image and provide:\n'+ '1. Room type and dimensions estimate\n'+ '2. Dominant colors in the room (walls, flooring, existing furniture)\n'+ '3. Interior design style (modern, traditional, minimalist, etc.)\n'+ '4. Lighting conditions\n'+ '5. Specific furniture recommendations from our catalog that would complement the space\n'+ '6. Color matching suggestions for each recommended piece\n'+ '7. Layout suggestions for furniture placement\n\n'+ 'Available furniture catalog:\n' +
                JSON.stringify(furnitureCatalog, null, 2) + '\n\n'+ 'Provide recommendations in JSON format with the following structure:\n'+ '{\n'+ '  "roomAnalysis": {\n' +
                '    "roomType": "string",\n' + '"estimatedDimensions": "string",\n' + '"dominantColors": ["color1", "color2", "color3"],\n' +
                '    "style": "string",\n' + '"lighting": "string"\n'+ '  },\n'+ '  "furnitureRecommendations": [\n'+ '    {\n'+ '      "furnitureId": "string",\n' + '"reason": "string",\n' + '"colorMatch": "string",\n' + '"placementSuggestion": "string",\n' + '"priority": "high|medium|low"\n'+ '    }\n'+ '  ],\n'+ '  "layoutSuggestions": [\n'+ '    {\n'+ '      "area": "string",\n' + '"suggestion": "string"\n'+ '    }\n'+ '  ],\n'+ '  "colorPaletteSuggestions": {\n' +
                '    "primary": "string",\n' + '"secondary": "string",\n' + '"accent": "string"\n'+ '  }\n'+ '}'
            },
            {
              type: 'image_url',
              image_url: {
                url: imageUrl
              }
            }
          ]
        }
      ],
      response_format: { type: 'json_object' },
      max_tokens: 2000
    });

    const analysis = JSON.parse(response?.choices?.[0]?.message?.content);

    return NextResponse?.json({
      success: true,
      analysis
    });
  } catch (error) {
    console.error('Error analyzing room:', error);
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      return NextResponse?.json(
        { error: 'Rate limit exceeded. Please try again later.', success: false },
        { status: 429 }
      );
    }
    
    if (error?.status === 401 || error?.code === 'invalid_api_key') {
      return NextResponse?.json(
        { error: 'Invalid OpenAI API key. Please check your configuration.', success: false },
        { status: 401 }
      );
    }

    if (error?.code === 'model_not_found') {
      return NextResponse?.json(
        { error: 'The AI model is not available. Please try again later.', success: false },
        { status: 503 }
      );
    }

    // Generic error response - ensure JSON format
    return NextResponse?.json(
      { 
        error: error?.message || 'Failed to analyze room image. Please try again.',
        success: false 
      },
      { status: 500 }
    );
  }
}