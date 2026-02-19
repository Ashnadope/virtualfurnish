# Virtual Room Designer - Quick Reference Guide

## 🎯 10-Step User Journey (Condensed)

| Step | What User Does | What System Does | Result |
|------|---|---|---|
| **1** | Opens Virtual Room Designer | Load products from database | Empty canvas with furniture palette |
| **2** | Clicks "Upload Room Photo" | Open upload modal | User can select image or paste URL |
| **3** | Uploads room image | Store image in Supabase, get URL | Image appears on canvas background |
| **4** | Clicks "Analyze with AI" | Send image + catalog to Nemotron API | AI returns room analysis & recommendations |
| **5** | Sees AI suggestions | Highlight recommended items in palette | Suggested furniture marked with ⭐ |
| **6** | Drags furniture to canvas | Capture drag event, update placement state | Furniture item appears at drop location |
| **7** | Adjusts position/rotation/scale | Update properties in real-time | Item moves/rotates/scales on canvas |
| **8** | Repeats 6-7 for more items | Build complete design | Canvas shows full room with all items |
| **9** | Clicks "Save Design" | Store design data to Supabase | Design saved with unique ID |
| **10** | Clicks "Add to Cart" | Add all items to cart service | Items ready for checkout |

---

## 📱 UI Layout

```
┌─────────────────────────────────────────────────────┐
│ Header: Brosas | [🛒 Cart] [👤 Profile]            │
├─────────────────────────────────────────────────────┤
│  ┌──────────────────┐        ┌─────────────────┐   │
│  │                  │        │                 │   │
│  │    CANVAS        │        │   FURNITURE     │   │
│  │    (Room +       │        │   PALETTE       │   │
│  │    Furniture)    │        │                 │   │
│  │                  │        │ [Item 1]        │   │
│  │  [Room Image]    │        │ [Item 2] ⭐    │   │
│  │   🛋️ 🪑 ☕       │        │ [Item 3]        │   │
│  │                  │        │ [Item 4] ⭐    │   │
│  └──────────────────┘        │ ...             │   │
│                              └─────────────────┘   │
├─────────────────────────────────────────────────────┤
│ [🤖 AI Analysis] [↩️ Undo] [↪️ Redo] [💾 Save]     │
├─────────────────────────────────────────────────────┤
│  Properties Panel (when item selected):             │
│  Position: X: ___ Y: ___ | Rotation: ___ | ...     │
└─────────────────────────────────────────────────────┘
```

---

## 🔄 Data Flow (Step by Step)

### Upload Image
```
User selects file
    ↓
Client validates (type, size)
    ↓
Upload to Supabase Storage
    ↓
Get signed URL
    ↓
Set uploadedImage state
    ↓
Canvas renders background image
```

### AI Analysis
```
User clicks "Analyze with AI"
    ↓
POST /api/room-analysis
  Payload: {
    imageUrl: "...",
    furnitureData: [...]
  }
    ↓
OpenRouter API (Nemotron Vision)
  • Analyze room colors, style, type
  • Match furniture from catalog
  • Generate recommendations
    ↓
Return analysis JSON
    ↓
Set aiAnalysis state
    ↓
Update furniture palette (highlight recommendations)
    ↓
Show analysis panel with results
```

### Place Furniture (Drag & Drop)
```
User drags furniture item
    ↓
dragstart event fires
  Capture: { furnitureId, name, image, price }
    ↓
User drops on canvas
    ↓
drop event fires
  Get canvas position: { x, y }
    ↓
Create placement object:
  {
    id: "placement-abc",
    furnitureId: "1",
    x: 320,
    y: 240,
    rotation: 0,
    scale: 1
  }
    ↓
Add to placedFurniture array
    ↓
Canvas re-renders with new item
    ↓
Item is now selectable/editable
```

### Adjust Properties
```
User clicks item on canvas
    ↓
Set selectedFurnitureId
    ↓
Properties panel opens
    ↓
User adjusts X position
    ↓
Update placedFurniture[index].x
    ↓
Canvas updates immediately
    ↓
Repeat for Y, rotation, scale, color
```

### Save Design
```
User clicks "Save Design"
    ↓
SaveDesignModal opens
    ↓
User enters:
  - Design name
  - Description (optional)
  - Visibility (private/public)
    ↓
User clicks Save
    ↓
POST /api/designs
  Payload: {
    name: "...",
    description: "...",
    room_image_url: "...",
    design_data: {
      furniture: [all placements],
      settings: {roomType, colors, style}
    },
    is_public: boolean,
    user_id: "current_user_id"
  }
    ↓
Supabase creates room_designs record
    ↓
Set currentDesignId
    ↓
Show confirmation
    ↓
Redirect to My Designs or offer checkout
```

### Add to Cart
```
User clicks "Add All to Cart"
    ↓
Loop through placedFurniture
    ↓
For each item:
  cartService.addItem({
    productId: furnitureId,
    quantity: 1,
    variantId: selected_variant
  })
    ↓
Items added to Supabase cart table
    ↓
Update cart count in header
    ↓
Show "Added to cart" toast
    ↓
Optional: Navigate to cart page
```

---

## 🎨 Component Structure

```
VirtualRoomDesignerInteractive (Main)
├── ImageUploadModal (Upload)
├── CanvasArea (Render + Drag)
├── FurniturePalette (Items list)
├── PropertiesPanel (Adjust)
├── AISuggestionControls (AI)
├── ActionToolbar (Undo/Redo/Save)
├── SaveDesignModal (Save)
└── ContinueDesignModal (Resume)
```

---

## 🔌 APIs Used

### Room Analysis
```
POST /api/room-analysis
Content-Type: application/json

{
  "imageUrl": "string (URL to room image)",
  "furnitureData": [
    {
      "id": "string",
      "name": "string", 
      "category": "string",
      "price": number,
      "material": "string",
      "dimensions": "string"
    }
  ]
}

Response:
{
  "success": true,
  "analysis": {
    "roomAnalysis": {
      "roomType": "string",
      "estimatedDimensions": "string",
      "dominantColors": ["color1", "color2"],
      "style": "string",
      "lighting": "string"
    },
    "furnitureRecommendations": [
      {
        "furnitureId": "string",
        "reason": "string",
        "colorMatch": "string",
        "placementSuggestion": "string",
        "priority": "high|medium|low"
      }
    ],
    "layoutSuggestions": [...],
    "colorPaletteSuggestions": {...}
  }
}
```

### Save Design
```
POST /api/designs
Content-Type: application/json

{
  "name": "string",
  "description": "string (optional)",
  "room_image_url": "string",
  "design_data": {
    "furniture": [
      {
        "id": "placement-id",
        "furnitureId": "product-id",
        "x": number,
        "y": number,
        "rotation": number,
        "scale": number
      }
    ],
    "settings": {
      "roomType": "string",
      "colors": ["color1", "color2"],
      "style": "string"
    }
  },
  "is_public": boolean
}

Response:
{
  "success": true,
  "design": {
    "id": "design-id",
    "name": "string",
    "share_token": "string (if public)"
  }
}
```

---

## 🛠️ Key States

| State | Type | Purpose |
|-------|------|---------|
| `uploadedImage` | File or URL | Current room photo |
| `placedFurniture` | Array | All furniture placements |
| `selectedFurnitureId` | String | Which item is selected |
| `aiAnalysis` | Object | Results from AI |
| `currentDesignId` | String | Saved design ID |
| `isProcessingAI` | Boolean | Loading AI response |
| `isSaving` | Boolean | Saving to database |
| `history` | Array | Undo/Redo stack |

---

## ⚙️ Features Checklist

- [x] Upload room image
- [x] Store image in cloud
- [x] AI room analysis
- [x] AI furniture recommendations
- [x] Drag & drop placement
- [x] Real-time canvas rendering
- [x] Position adjustments
- [x] Rotation controls
- [x] Scale controls
- [x] Color/variant selection
- [x] Save design to database
- [x] Load previous designs
- [x] Undo/Redo functionality
- [x] Add design items to cart
- [x] Share design with token
- [x] Public/private visibility

---

## 🐛 Troubleshooting

**Image won't upload?**
- Check file size (max 10MB)
- Check file type (JPG, PNG, WebP only)
- Try URL upload instead

**AI analysis takes too long?**
- Free tier has rate limits
- Retry after a few seconds
- Check API key is valid

**Furniture won't drag?**
- Make sure canvas has focus
- Ensure browser supports HTML5 drag/drop
- Check console for JavaScript errors

**Design won't save?**
- Enter a design name (required)
- Check you're logged in
- Check internet connection
- Check Supabase database is accessible

**Items don't appear in cart?**
- Refresh page to see updated count
- Check cart service is working
- Verify database cart table has items

---

## 📊 Performance Tips

✅ Canvas renders with React.memo  
✅ Furniture images lazy-loaded  
✅ State updates debounced  
✅ Supabase queries optimized  
✅ Large furniture lists paginated  
✅ Auto-save drafts every 30 seconds (recommended)  

---

## 📚 Related Documentation

- [API Testing Guide](./API_TESTING_GUIDE.md)
- [Virtual Room Designer Flow](./VIRTUAL_ROOM_DESIGNER_FLOW.md)
- [User Flow Diagrams](./USER_FLOW_DIAGRAMS.md)
- [Room Design Service](./src/services/roomDesign.service.js)

