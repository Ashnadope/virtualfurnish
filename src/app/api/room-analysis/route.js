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
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Validate OpenAI client initialization
    if (!openai) {
      return NextResponse?.json(
        { 
          error: 'OpenAI client failed to initialize. Please check your API configuration.',
          success: false 
        },
        { 
          status: 500,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    const { imageUrl, furnitureData } = await request?.json();

    if (!imageUrl) {
      return NextResponse?.json(
        { error: 'Image URL is required', success: false },
        { 
          status: 400,
          headers: {
            'Content-Type': 'application/json',
          }
        }
      );
    }

    // Create furniture catalog summary for AI context
    // furnitureData is already expanded per-variant, so each item has its own color/image
    const furnitureCatalog = furnitureData?.map(item => ({
      id: item?.id,
      name: item?.name,          // already includes color, e.g. "Sofa (Dark Grey)"
      category: item?.category,
      color: item?.color || null,
      material: item?.material || null,
      dimensions: item?.dimensions || null,
      price: item?.price
    }));

    // Detect which API is being used and select appropriate model
    const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-');
    const model = isOpenRouter ? 'nvidia/nemotron-nano-12b-v2-vl' : 'gpt-4o';

    // Build request params - JSON mode only supported by OpenAI
    const requestParams = {
      model: model,
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
              text: 'Analyze this room image and provide:\n'+ '1. Room type and dimensions estimate\n'+ '2. Dominant colors in the room (walls, flooring, existing furniture) - include hex codes\n'+ '3. Interior design style (modern, traditional, minimalist, etc.)\n'+ '4. Lighting conditions\n'+ '5. Specific furniture recommendations from our catalog that would complement the space\n'+ '6. Color matching suggestions for each recommended piece\n'+ '7. Layout suggestions for furniture placement, including estimated canvas coordinates\n\n'+ 'COORDINATE SYSTEM: The room canvas uses percentage-based coordinates (x: 0=far left, 100=far right; y: 0=top, 100=bottom). IMPORTANT: this is a perspective photo shot from the doorway. The back wall floor line is typically at y=38-48, mid-room floor at y=55-65, and items near the camera at y=75+. Do NOT place furniture above y=35 as that is wall/ceiling space. Estimate realistic floor-level placement for each piece.\n\n'+ 'Available furniture catalog:\n' +
                JSON.stringify(furnitureCatalog, null, 2) + '\n\n'+ 'Respond ONLY with a single valid JSON object — no markdown, no code fences, no explanation. Use this exact structure:\n'+ '{\n'+ '  "roomAnalysis": {\n'+ '    "roomType": "string",\n'+ '    "estimatedDimensions": "string",\n'+ '    "dominantColors": ["ColorName (#HEXCODE)", "ColorName (#HEXCODE)", "ColorName (#HEXCODE)"],\n'+ '    "style": "string",\n'+ '    "lighting": "string"\n'+ '  },\n'+ '  "furnitureRecommendations": [\n'+ '    {\n'+ '      "furnitureId": "string — use the EXACT id field from the catalog entry",\n'+ '      "reason": "string",\n'+ '      "colorMatch": "string",\n'+ '      "placementSuggestion": "string (human-readable placement description)",\n'+ '      "priority": "high or medium or low (all lowercase)",\n'+ '      "suggestedPosition": { "x": number_0_to_100, "y": number_0_to_100 }\n'+ '    }\n'+ '  ],\n'+ '  "layoutSuggestions": [\n'+ '    {\n'+ '      "area": "string",\n'+ '      "suggestion": "string"\n'+ '    }\n'+ '  ],\n'+ '  "colorPaletteSuggestions": {\n'+ '    "primary": "#HEXCODE",\n'+ '    "secondary": "#HEXCODE",\n'+ '    "accent": "#HEXCODE"\n'+ '  }\n'+ '}'
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
      max_tokens: 2000
    };

    // Only add JSON format for OpenAI (not supported by Nemotron)
    if (!isOpenRouter) {
      requestParams.response_format = { type: 'json_object' };
    }

    const response = await openai?.chat?.completions?.create(requestParams);

    // Extract and parse response
    const responseContent = response?.choices?.[0]?.message?.content || '{}';
    
    // For Nemotron, try to extract JSON from the response text
    let analysis = {};
    try {
      analysis = JSON.parse(responseContent);
    } catch (parseError) {
      // If parsing fails, try to extract JSON from text
      const jsonMatch = responseContent.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        try {
          analysis = JSON.parse(jsonMatch[0]);
        } catch (e) {
          // If still failed, create a minimal response from the text
          console.warn('Could not parse AI response as JSON, creating minimal response');
          analysis = {
            roomAnalysis: {
              roomType: 'Unknown',
              estimatedDimensions: 'Unknown',
              dominantColors: ['Unknown'],
              style: 'Unknown',
              lighting: 'Unknown'
            },
            furnitureRecommendations: [],
            layoutSuggestions: [],
            colorPaletteSuggestions: {
              primary: 'Unknown',
              secondary: 'Unknown',
              accent: 'Unknown'
            }
          };
        }
      }
    }

    // Normalize analysis fields to ensure consistent casing/types regardless of model output
    if (analysis?.furnitureRecommendations) {
      analysis.furnitureRecommendations = analysis.furnitureRecommendations.map(rec => ({
        ...rec,
        // Ensure priority is always lowercase
        priority: (rec.priority || 'medium').toLowerCase(),
        // Ensure suggestedPosition values are numbers, not strings
        suggestedPosition: rec.suggestedPosition ? {
          x: Number(rec.suggestedPosition.x) || 40,
          y: Number(rec.suggestedPosition.y) || 42
        } : null
      }));
    }

    return NextResponse?.json(
      {
        success: true,
        analysis
      },
      {
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  } catch (error) {
    console.error('Error analyzing room:', error);
    
    // Build detailed error message
    let errorMessage = 'Failed to analyze room image. Please try again.';
    let statusCode = 500;
    
    // Handle specific OpenAI errors
    if (error?.status === 429) {
      errorMessage = 'Rate limit exceeded. Please try again later.';
      statusCode = 429;
    } else if (error?.status === 401 || error?.code === 'invalid_api_key') {
      errorMessage = 'Invalid OpenAI API key. Please check your OPENAI_API_KEY environment variable.';
      statusCode = 401;
    } else if (error?.code === 'model_not_found') {
      errorMessage = 'The AI model is not available. Please try again later.';
      statusCode = 503;
    } else if (error?.message) {
      errorMessage = error?.message;
    }

    // Always return JSON, even for errors
    return NextResponse?.json(
      { 
        error: errorMessage,
        success: false,
        details: process.env.NODE_ENV === 'development' ? error?.message : undefined
      },
      { 
        status: statusCode,
        headers: {
          'Content-Type': 'application/json',
        }
      }
    );
  }
}