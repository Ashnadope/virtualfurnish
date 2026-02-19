# Virtual Room Designer - User Flow Documentation

## 📱 System User Journey

This document shows the complete flow from a user's perspective when using the Virtual Room Designer system.

---

## **Step 1️⃣: User Lands on Virtual Room Designer**

```
┌─────────────────────────────────────────────┐
│  Virtual Room Designer Page                 │
│                                             │
│  [🏠 Upload Room Photo Button]             │
│  [📐 Canvas Area - Empty]                   │
│  [🛋️ Furniture Palette - Available Items]  │
│                                             │
│  "Start designing your perfect room!"       │
└─────────────────────────────────────────────┘
```

**What happens:**
- Page loads with all products from database
- User sees empty canvas
- Furniture palette shows all available items with images, prices, and stock status
- System checks if user has previous designs → shows "Continue Design" option

---

## **Step 2️⃣: Upload Room Photo**

```
┌──────────────────────────────────────────────────┐
│  Upload Room Photo Modal                         │
│                                                  │
│  📸 [Select Image from Device]                  │
│     ├─ JPG, PNG, WebP (< 10MB)                  │
│     └─ Auto-resized for optimization            │
│                                                  │
│  OR                                              │
│                                                  │
│  🔗 [Paste Image URL]                           │
│     ├─ Unsplash                                  │
│     ├─ URL Preview                              │
│     └─ Validate & Load                          │
│                                                  │
│  [Cancel] [Upload to Canvas] ✓                 │
└──────────────────────────────────────────────────┘
        ↓
        Uploaded image appears on canvas
        (Acts as background reference)
```

**Backend Process:**
```
User uploads image
    ↓
File validation (type, size)
    ↓
Image stored in Supabase Storage
    ↓
Image path saved to design record
    ↓
Canvas renders image as background
```

---

## **Step 3️⃣: AI Analyzes Room (Optional)**

```
┌────────────────────────────────────────────────────┐
│  AI Suggestion Controls                            │
│                                                    │
│  [🤖 Analyze Room with AI]                        │
│     └─ Sends: Image URL + Furniture Catalog       │
│                                                    │
│  ⏳ Processing... (3-5 seconds)                    │
│                                                    │
│  📊 Results:                                       │
│    ✓ Room Type: Living Room                        │
│    ✓ Colors: Beige, Brown, White                   │
│    ✓ Style: Modern Minimalist                      │
│    ✓ Recommended Furniture (5 items)               │
│    ✓ Layout Suggestions                            │
│    ✓ Color Palette Tips                            │
│                                                    │
│  [View Analysis] [Clear] [Apply Suggestions]      │
└────────────────────────────────────────────────────┘
```

**AI Processing:**

```javascript
// Request to /api/room-analysis
POST /api/room-analysis
{
  "imageUrl": "https://...",
  "furnitureData": [
    {
      "id": "1",
      "name": "Modern Sofa",
      "category": "Living Room",
      "price": 24999,
      ...
    },
    {...}, {...}
  ]
}

↓

[OpenRouter: Nemotron Vision Model]
  • Analyzes image for room type
  • Detects colors & materials
  • Identifies style/design
  • Examines lighting
  • Matches furniture from catalog

↓

// Response
{
  "success": true,
  "analysis": {
    "roomAnalysis": {
      "roomType": "Living Room",
      "estimatedDimensions": "15ft x 20ft",
      "dominantColors": ["Beige", "Brown", "White"],
      "style": "Modern Minimalist",
      "lighting": "Natural light"
    },
    "furnitureRecommendations": [
      {
        "furnitureId": "1",
        "reason": "Matches the neutral palette",
        "colorMatch": "Beige fabric",
        "placementSuggestion": "Center of room",
        "priority": "high"
      },
      {...}, {...}
    ]
  }
}
```

---

## **Step 4️⃣: See AI Suggestions in Furniture Palette**

```
┌─────────────────────────────────────────┐
│  Furniture Palette (Updated)            │
│                                         │
│  🎯 RECOMMENDED BY AI:                  │
│  ┌──────────────────────────────────┐   │
│  │ ⭐ Modern Sofa                   │   │
│  │ Price: ₱24,999                  │   │
│  │ Color: Beige ✓ Matches room     │   │
│  │ [Drag to Canvas] [Add to Cart]  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ┌──────────────────────────────────┐   │
│  │ ⭐ Coffee Table                  │   │
│  │ Price: ₱8,999                   │   │
│  │ Color: Oak - Complements sofa   │   │
│  │ [Drag to Canvas] [Add to Cart]  │   │
│  └──────────────────────────────────┘   │
│                                         │
│  ─────────────────────────────────────  │
│                                         │
│  📦 ALL FURNITURE:                      │
│  ┌──────────────┐  ┌──────────────┐     │
│  │ Bed Frame    │  │ Dining Set   │     │
│  │ ₱15,999      │  │ ₱32,999      │     │
│  │ [Drag] [+]   │  │ [Drag] [+]   │     │
│  └──────────────┘  └──────────────┘     │
│    ...more items                        │
│                                         │
└─────────────────────────────────────────┘
```

**Frontend State:**
```javascript
{
  furnitureData: [
    {
      id: "1",
      name: "Modern Sofa",
      aiRecommended: true,
      reason: "Matches the neutral palette",
      priority: "high",
      isHighlighted: true
    },
    {...}
  ]
}
```

---

## **Step 5️⃣: Drag & Drop Furniture to Canvas**

```
┌──────────────────────────────────────────────────┐
│  CANVAS AREA                                     │
│                                                  │
│  ┌────────────────────────────────────────────┐  │
│  │ 🏠 [Room Photo Background]                 │  │
│  │                                            │  │
│  │     ┌─────────────┐                        │  │
│  │     │ 🛋️ Sofa    │ ← User drags here     │  │
│  │     │  (Placed)   │                        │  │
│  │     └─────────────┘                        │  │
│  │                                            │  │
│  │                  ┌─────────┐               │  │
│  │                  │ 🪑 Chair│               │  │
│  │                  │(Placed) │               │  │
│  │                  └─────────┘               │  │
│  │                                            │  │
│  │    ┌──────────────┐                        │  │
│  │    │ ☕ Coffee Tbl│                        │  │
│  │    │   (Placed)   │                        │  │
│  │    └──────────────┘                        │  │
│  │                                            │  │
│  └────────────────────────────────────────────┘  │
│                                                  │
│  🔧 Action Toolbar:                             │
│  [↩️ Undo] [↪️ Redo] [🗑️ Delete] [💾 Save]     │
│                                                  │
│  📏 Properties Panel (when item selected):       │
│  [Position] [Rotation] [Size] [Color] [Remove]  │
└──────────────────────────────────────────────────┘
```

### **Drag & Drop Mechanics:**

```javascript
// User drags furniture from palette to canvas

DRAG EVENT FLOW:
1. User clicks & holds furniture item
2. dragstart → Capture furniture data
   {
     id: "1",
     name: "Modern Sofa",
     image: "...",
     price: 24999,
     dimensions: "200x100x80",
     materialColor: "Beige"
   }

3. User drags over canvas → Visual feedback
   - Canvas background highlights
   - Shows drop zone preview
   - "Drop here to place"

4. User releases mouse → DROP
   {
     action: "PLACE_FURNITURE",
     furnitureId: "1",
     canvasPosition: { x: 320, y: 240 },
     rotation: 0,
     scale: 1,
     timestamp: "2024-02-20T10:30:00Z"
   }

5. STATE UPDATE:
   placedFurniture = [
     {
       id: "placement-001",
       furnitureId: "1",
       name: "Modern Sofa",
       x: 320,
       y: 240,
       rotation: 0,
       scale: 1,
       timestamp: "2024-02-20T10:30:00Z"
     }
   ]

6. CANVAS RENDERS NEW ITEM
   - Item appears at drop position
   - Item is now selectable
   - User can adjust position/rotation/scale
```

---

## **Step 6️⃣: Adjust Furniture Placement**

```
┌─────────────────────────────────────────────────┐
│  PROPERTIES PANEL (Selected Item)               │
│                                                 │
│  Modern Sofa                                    │
│  ┌──────────────────────────────────────────┐  │
│  │ 📍 Position                              │  │
│  │  X: ████████░░ 320px                     │  │
│  │  Y: ░░░░░░░░░░ 240px                     │  │
│  │                                          │  │
│  │ 🔄 Rotation                              │  │
│  │    ^^^^^^ 0° ↻ ↙ ↘                       │  │
│  │                                          │  │
│  │ 📏 Scale                                 │  │
│  │    100% ████████░░ [ +/- ]               │  │
│  │                                          │  │
│  │ 🎨 Color Variant                         │  │
│  │    [Beige ▼] [Charcoal] [Navy]           │  │
│  │                                          │  │
│  │ [Save Properties] [Duplicate] [Delete ✕] │  │
│  └──────────────────────────────────────────┘  │
└─────────────────────────────────────────────────┘

User also can:
- Click item on canvas to select
- Drag item to move (visual handles)
- Double-click to edit properties
- Right-click for context menu
```

---

## **Step 7️⃣: Build Complete Design**

```
┌────────────────────────────────────────────────────┐
│  FINAL DESIGN - Canvas View                        │
│                                                    │
│  ┌──────────────────────────────────────────────┐  │
│  │ 🏠 [Room Photo]                              │  │
│  │                                              │  │
│  │      🛋️          ☕         🪑               │  │
│  │   [Sofa]    [Coffee Tbl]   [Chair]          │  │
│  │                                              │  │
│  │  🛏️              📺                           │  │
│  │ [Bed]        [Dresser]                       │  │
│  │                                              │  │
│  │              [Bookshelf]                     │  │
│  │                 📚                           │  │
│  │                                              │  │
│  └──────────────────────────────────────────────┘  │
│                                                    │
│  📊 Design Summary:                                │
│  • Items: 6 pieces                                 │
│  • Total Estimated Cost: ₱95,000                   │
│  • Room Coverage: 45%                              │
│  • Style Match Score: 92%                          │
│                                                    │
│  [🛒 Add All to Cart] [💾 Save Design] [📤 Share] │
└────────────────────────────────────────────────────┘
```

---

## **Step 8️⃣: Save Design**

```
┌──────────────────────────────────────────────────┐
│  Save Design Modal                               │
│                                                  │
│  Design Name:                                    │
│  [My Modern Living Room_____________]            │
│                                                  │
│  Description (Optional):                         │
│  ┌──────────────────────────────────────┐       │
│  │ A cozy modern living room design...  │       │
│  │ Perfect for family gatherings        │       │
│  └──────────────────────────────────────┘       │
│                                                  │
│  📸 Preview: [Room photo thumbnail]             │
│                                                  │
│  🔒 Visibility:                                  │
│  ⦿ Private (Only me)                            │
│  ◯ Public (Share with link)                     │
│                                                  │
│  [Cancel] [Save Design]                         │
└──────────────────────────────────────────────────┘

↓ SAVES TO DATABASE:

{
  id: "design-abc123",
  userId: "user-xyz",
  name: "My Modern Living Room",
  description: "A cozy modern living room...",
  room_image_url: "designs/room-abc123.jpg",
  render_url: null,
  design_data: {
    furniture: [
      {
        id: "place-001",
        furnitureId: "1",
        name: "Modern Sofa",
        x: 320,
        y: 240,
        rotation: 0,
        scale: 1
      },
      {...}, {...}
    ],
    settings: {
      roomDimensions: "15ft x 20ft",
      style: "Modern Minimalist",
      colors: ["Beige", "Brown", "White"]
    }
  },
  is_public: false,
  created_at: "2024-02-20T10:45:00Z",
  updated_at: "2024-02-20T10:45:00Z"
}
```

---

## **Step 9️⃣: Add to Cart & Checkout**

```
┌─────────────────────────────────────┐
│  Quick Actions:                     │
│                                     │
│  [🛒 Add All Items to Cart]        │
│     └─ Adds all 6 items            │
│                                     │
│  [🏪 View Individual Items]        │
│     ├─ Modern Sofa: ₱24,999        │
│     ├─ Coffee Table: ₱8,999        │
│     ├─ Chair: ₱12,999              │
│     ├─ Bed Frame: ₱15,999          │
│     ├─ Dresser: ₱18,999            │
│     └─ Bookshelf: ₱15,000          │
│     TOTAL: ₱95,995                 │
│                                     │
│  [Proceed to Checkout]              │
└─────────────────────────────────────┘

↓

┌─────────────────────────────────┐
│  Cart Page                      │
│                                 │
│  [Selected 6 items]             │
│  Subtotal: ₱95,995             │
│  Shipping: ₱1,000              │
│  Tax: ₱7,200                   │
│  ─────────────────────          │
│  Total: ₱104,195               │
│                                 │
│  [Proceed to Checkout]         │
└─────────────────────────────────┘

↓

Login / Enter shipping address
↓
Choose payment method
↓
Complete purchase
```

---

## **Step 🔟: View & Share Design**

```
┌────────────────────────────────────────────────┐
│  Saved Design - My Designs Page                │
│                                                │
│  ┌──────────────────────────────────────────┐  │
│  │ 📸 [Room Design Preview Thumbnail]       │  │
│  │                                          │  │
│  │ My Modern Living Room                    │  │
│  │ Created: Feb 20, 2024                    │  │
│  │ Items: 6 | Total Cost: ₱95,995           │  │
│  │                                          │  │
│  │ [Edit Design] [Share Link] [Delete]      │  │
│  └──────────────────────────────────────────┘  │
│                                                │
│  [Share Design]                                │
│  ↓                                             │
│  Share Token: design_abc123_xyz                │
│  Link: https://brosas.com/shared/design_token │
│  ✓ Shareable with friends                      │
│  ✓ Read-only view                              │
│                                                │
└────────────────────────────────────────────────┘
```

---

## **Complete Data Flow Architecture**

```
CLIENT (Browser)
│
├─ User Action: Upload Image
│  └──→ ImageUploadModal
│       └──→ File upload to Supabase Storage
│           └──→ Store image path in design record
│
├─ User Action: Get AI Suggestions
│  └──→ AISuggestionControls
│       └──→ POST /api/room-analysis
│           ├─ Payload: { imageUrl, furnitureData }
│           └─→ [OpenRouter Nemotron API]
│               └──→ Response: { roomAnalysis, recommendations }
│                   └──→ Display in analysis panel
│
├─ User Action: Drag & Drop
│  └──→ CanvasArea (React DnD)
│       └──→ placedFurniture state update
│           └──→ Canvas re-renders with new item
│
├─ User Action: Adjust Properties
│  └──→ PropertiesPanel
│       └──→ Update item position/rotation/scale
│           └──→ Canvas updates in real-time
│
├─ User Action: Save Design
│  └──→ SaveDesignModal
│       └──→ POST /api/room-designs (Supabase)
│           └──→ Stores full design_data object
│               └──→ Redirect to My Designs or confirmation
│
└─ User Action: Add to Cart
   └──→ cartService.addItem()
        └──→ Supabase cart table
            └──→ Show cart count in header
                └──→ Redirect to checkout

DATABASE RECORDS CREATED:
├─ room_designs table
│  ├─ id, user_id, name, description
│  ├─ room_image_url (path to uploaded image)
│  ├─ design_data (furniture placements JSON)
│  ├─ is_public, share_token
│  └─ created_at, updated_at
│
└─ storage bucket: room-images/
   ├─ user_id/room_upload_abc123.jpg
   └─ user_id/design_render_abc123.jpg (optional)
```

---

## **Key Features Explained**

### 🤖 **AI Room Analysis**
- Uses Nemotron Vision model to analyze uploaded room images
- Extracts room type, colors, lighting, and style
- Recommends furniture from catalog that matches the space
- Provides layout and color matching suggestions
- Response in ~3-5 seconds

### 🎯 **Smart Recommendation System**
- AI highlights best furniture matches
- Shows priority level (high/medium/low)
- Explains why item is recommended
- Suggests specific placement locations

### 🖱️ **Drag & Drop Interface**
- Intuitive furniture placement
- Real-time canvas updates
- Rotate, scale, and reposition items
- Visual feedback while dragging
- Undo/Redo functionality

### 💾 **Design Persistence**
- All designs saved to Supabase
- Can continue editing later
- Share designs with unique tokens
- Access design history

### 🛒 **Seamless Shopping Integration**
- Add individual items or entire design to cart
- Direct checkout from designer
- Price summaries and totals
- Inventory tracking

---

## **Error Handling**

```
Upload Fails
├─ File too large → "Maximum 10MB"
├─ Invalid format → "Only JPG, PNG, WebP"
└─ Network error → Retry or try URL input

AI Analysis Fails
├─ No API key → "AI features disabled"
├─ Rate limit → "Try again in a moment"
├─ Invalid image → "Image could not be analyzed"
└─ Model error → "AI service temporarily unavailable"

Save Fails
├─ Not authenticated → Redirect to login
├─ Network error → "Could not save, check connection"
└─ No name provided → "Please enter a design name"
```

---

## **Performance Optimizations**

✅ Image lazy loading  
✅ Canvas optimization (canvas element)  
✅ Debounced property updates  
✅ Efficient state management  
✅ Supabase real-time subscriptions  
✅ CDN for furniture images  

---

## **Next Steps (Future Enhancements)**

🔮 Render preview (generate 3D-like image)  
🔮 AR preview (view design in real room)  
🔮 Measurements & scale (true-to-size)  
🔮 Material customization (fabric texture)  
🔮 Lighting simulation  
🔮 Collaboration (design with friends)  
🔮 Design templates (quick-start designs)  
🔮 Budget recommendations  
