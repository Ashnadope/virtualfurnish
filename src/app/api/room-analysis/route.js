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

    // Build a compact catalog for the AI.
    // Sort deterministically so the tokenized prefix is byte-for-byte identical on every
    // request → OpenAI prompt cache hits on the catalog portion (~26k tokens).
    // Short numeric IDs replace UUIDs (~10 tokens → 1 token each, saves ~8k tokens).
    // Price omitted — not used for style/color matching (saves another ~3k tokens).
    // idMap resolves short IDs back to real UUIDs after the AI responds.
    const sortedItems = [...(furnitureData || [])].sort((a, b) =>
      String(a?.id).localeCompare(String(b?.id))
    );
    const idMap = new Map(); // shortId → real UUID
    const furnitureCatalog = sortedItems.map((item, index) => {
      const shortId = index + 1;
      idMap.set(shortId, item?.id);
      idMap.set(String(shortId), item?.id); // AI may return id as a string
      return {
        id: shortId,
        name: item?.name,   // already includes color, e.g. "Sofa (Dark Grey)"
        category: item?.category
      };
    });

    // Detect which API is being used and select model + build prompt accordingly.
    // OpenAI: json_object mode enforces valid JSON output → shorter, cleaner prompt.
    // OpenRouter/Nemotron: no JSON mode → needs explicit schema + detailed instructions.
    const isOpenRouter = process.env.OPENAI_API_KEY?.startsWith('sk-or-v1-');

    const catalogJson = JSON.stringify(furnitureCatalog);

    // ── Shared schema string (used by both prompts) ──────────────────────────────
    const schemaBlock =
      '{\n' +
      '  "roomAnalysis": {\n' +
      '    "roomType": "string",\n' +
      '    "estimatedDimensions": "string",\n' +
      '    "dominantColors": ["ColorName (#HEXCODE)"],\n' +
      '    "style": "string",\n' +
      '    "lighting": "string"\n' +
      '  },\n' +
      '  "furnitureRecommendations": [\n' +
      '    {\n' +
      '      "furnitureId": "EXACT id from catalog",\n' +
      '      "furnitureName": "EXACT name from catalog",\n' +
      '      "reason": "string",\n' +
      '      "colorMatch": "string",\n' +
      '      "placementSuggestion": "string",\n' +
      '      "priority": "high or medium or low",\n' +
      '      "suggestedPosition": { "x": number, "y": number }\n' +
      '    }\n' +
      '  ],\n' +
      '  "layoutSuggestions": [\n' +
      '    { "area": "e.g. Seating zone", "suggestion": "e.g. Place sofa facing the window for natural light" },\n' +
      '    { "area": "e.g. Sleeping area", "suggestion": "e.g. Center the bed on the main wall for balance" }\n' +
      '  ],\n' +
      '  "colorPaletteSuggestions": { "primary": "#HEX", "secondary": "#HEX", "accent": "#HEX" }\n' +
      '}';

    // ── Coordinate hint (shared) ─────────────────────────────────────────────────
    const coordHint =
      'COORDINATE SYSTEM: percentage-based (x: 0=left, 100=right; y: 0=top, 100=bottom). ' +
      'Do NOT place items above y=35 (wall/ceiling). Back wall ~y=42, mid-room ~y=60, near camera y=75+.';

    let requestParams;

    if (isOpenRouter) {
      // ── OpenRouter / Nemotron ────────────────────────────────────────────────
      // No JSON mode available. Use a detailed, explicit prompt so the model
      // understands it must output only raw JSON with no surrounding text.
      requestParams = {
        model: 'nvidia/nemotron-nano-12b-v2-vl',
        messages: [
          {
            role: 'system',
            content:
              'You are an expert interior designer AI for VirtualFurnish. ' +
              'Analyze room images and recommend furniture from a provided catalog. ' +
              'You MUST respond with a single raw JSON object and absolutely nothing else — ' +
              'no markdown, no code fences, no explanation, no preamble.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this room image and recommend furniture from the catalog below.\n\n' +
                  coordHint + '\n\n' +
                  'Available furniture catalog:\n' + catalogJson + '\n\n' +
                  'Respond ONLY with a single valid JSON object — no markdown, no code fences, no explanation. ' +
                  'Use this exact structure:\n' + schemaBlock
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_tokens: 2000  // OpenRouter uses max_tokens
      };
    } else {
      // ── OpenAI (gpt-4o-mini) ────────────────────────────────────────────────
      // Non-reasoning model: responds directly without internal chain-of-thought.
      // JSON mode guarantees valid JSON. Much cheaper per call than reasoning models
      // because there are no hidden reasoning tokens billed at output rates.
      requestParams = {
        model: 'gpt-4o-mini',
        response_format: { type: 'json_object' },
        messages: [
          {
            role: 'system',
            content:
              'You are an expert interior designer AI for VirtualFurnish. ' +
              'Analyze room images and recommend furniture from a provided catalog. ' +
              'Always respond with a valid JSON object matching the requested schema.'
          },
          {
            role: 'user',
            content: [
              {
                type: 'text',
                text:
                  'Analyze this room image. ' + coordHint + '\n\n' +
                  'Furniture catalog:\n' + catalogJson + '\n\n' +
                  'Return a JSON object with these keys: ' +
                  'roomAnalysis (roomType, estimatedDimensions, dominantColors as array of "ColorName (#HEXCODE)" strings e.g. ["White (#FFFFFF)","Brown (#8B4513)"], style, lighting), ' +
                  'furnitureRecommendations (array of: furnitureId, furnitureName, reason, colorMatch, placementSuggestion, priority, suggestedPosition {x,y}), ' +
                  'layoutSuggestions (array of: area, suggestion), ' +
                  'colorPaletteSuggestions (primary, secondary, accent hex codes). ' +
                  'Use EXACT id and name values from the catalog. Priority must be high, medium, or low.'
              },
              { type: 'image_url', image_url: { url: imageUrl } }
            ]
          }
        ],
        max_completion_tokens: 2000  // gpt-4o-mini: no reasoning overhead, 2000 is sufficient for full JSON response
      };
    }

    const response = await openai?.chat?.completions?.create(requestParams);
    const usage = response?.usage;
    const cached = usage?.prompt_tokens_details?.cached_tokens ?? 0;
    console.log(
      `[room-analysis] model=${requestParams.model}`,
      `| prompt=${usage?.prompt_tokens} (cached=${cached})`,
      `| completion=${usage?.completion_tokens}`,
      `| total=${usage?.total_tokens}`
    );

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
    // Normalize roomAnalysis scalar fields — models sometimes return objects
    if (analysis?.roomAnalysis) {
      const ed = analysis.roomAnalysis.estimatedDimensions;
      if (ed && typeof ed === 'object') {
        // e.g. { width: "10m", length: "12m" } → "10m × 12m"
        analysis.roomAnalysis.estimatedDimensions =
          Object.values(ed).filter(Boolean).join(' × ') || 'Unknown';
      }
    }

    if (analysis?.furnitureRecommendations) {
      analysis.furnitureRecommendations = analysis.furnitureRecommendations.map(rec => ({
        ...rec,
        // Resolve short numeric catalog ID back to the real UUID
        furnitureId: idMap.get(Number(rec.furnitureId)) || idMap.get(rec.furnitureId) || rec.furnitureId,
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