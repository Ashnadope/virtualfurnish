# User Flow Diagrams - Virtual Room Designer

## 1. Complete User Journey (High Level)

```mermaid
graph TD
    A["🏠 User Opens Virtual Room Designer"] --> B["📸 Upload Room Photo"]
    B --> C["🤖 AI Analyzes Room<br/>3-5 seconds"]
    C --> D["📊 See Recommendations<br/>5-8 furniture suggestions"]
    D --> E["🖱️ Drag & Drop Furniture<br/>to Canvas"]
    E --> F["🎯 Adjust Placement<br/>Position, Rotation, Scale"]
    F --> G{"Done<br/>Designing?"}
    G -->|No, Add More| E
    G -->|Yes| H["💾 Save Design"]
    H --> I["🛒 Add to Cart"]
    I --> J["💳 Checkout"]
    J --> K["✅ Order Confirmed"]
    
    style A fill:#e1f5ff
    style B fill:#fff3e0
    style C fill:#f3e5f5
    style D fill:#e8f5e9
    style E fill:#fce4ec
    style H fill:#f1f8e9
    style K fill:#c8e6c9
```

## 2. Upload & Analysis Flow

```mermaid
graph LR
    A["User Uploads Image"] --> B{"Validate<br/>File"}
    B -->|Valid| C["Store in Supabase<br/>Storage"]
    B -->|Invalid| D["❌ Show Error<br/>Max 10MB, JPG/PNG/WebP"]
    C --> E["Get Image URL"]
    E --> F["Send to AI API<br/>POST /api/room-analysis"]
    F --> G["🤖 OpenRouter<br/>Nemotron Model"]
    G --> H["Analyze Image"]
    H --> I["Match Catalog<br/>Items"]
    I --> J["Return<br/>Recommendations"]
    J --> K["Display in<br/>Furniture Palette"]
    
    D -.->|User Retries| A
    
    style A fill:#fff3e0
    style K fill:#e8f5e9
    style G fill:#f3e5f5
```

## 3. Drag & Drop Placement Flow

```mermaid
graph TD
    A["User Starts Dragging<br/>Furniture Item"] --> B["dragstart Event<br/>Capture furniture data:<br/>id, name, image, price"]
    B --> C["User Drags Over Canvas"]
    C --> D["Visual Feedback:<br/>Canvas highlights<br/>Show drop zone"]
    D --> E["User Releases<br/>Mouse"]
    E --> F["DROP Event"]
    F --> G["Create placement record:<br/>furnitureId, x, y,<br/>rotation, scale"]
    G --> H["Update placedFurniture<br/>state"]
    H --> I["Canvas Re-renders<br/>New item visible"]
    I --> J["Item now selectable<br/>& editable"]
    
    style A fill:#fce4ec
    style E fill:#fce4ec
    style I fill:#e8f5e9
    style J fill:#c8e6c9
```

## 4. Properties Adjustment Flow

```mermaid
graph TD
    A["User Clicks Item<br/>on Canvas"] --> B["Item Selected<br/>Show Handles"]
    B --> C["Open Properties Panel"]
    C --> D{{"User Adjusts:"}}
    D --> E["📍 Position X/Y"]
    D --> F["🔄 Rotation 0-360°"]
    D --> G["📏 Scale 50%-150%"]
    D --> H["🎨 Color/Variant"]
    E --> I["Update State"]
    F --> I
    G --> I
    H --> I
    I --> J["Canvas Updates<br/>in Real-time"]
    J --> K["Visual Feedback<br/>Item moves/rotates/scales"]
    K --> L["Save on Focus Loss<br/>or 'Save Properties'"]
    
    style A fill:#fce4ec
    style C fill:#e3f2fd
    style J fill:#e8f5e9
    style L fill:#fff9c4
```

## 5. Save Design Flow

```mermaid
graph TD
    A["User Clicks<br/>Save Design"] --> B["Save Design Modal<br/>Opens"]
    B --> C["Enter Design Info:<br/>Name, Description"]
    C --> D["Choose Visibility:<br/>Private or Public"]
    D --> E["Review Preview<br/>Room image + items"]
    E --> F["Click Save"]
    F --> G["Validate Data"]
    G -->|Missing Name| H["❌ Error:<br/>Name Required"]
    G -->|Valid| I["Create Design Record"]
    H -.->|Fix| C
    I --> J["Generate Share Token<br/>if Public"]
    J --> K["Save to Supabase<br/>room_designs table"]
    K --> L["Store Design Data JSON:<br/>furniture placements<br/>settings"]
    L --> M["✅ Success"]
    M --> N["Show Confirmation"]
    N --> O["Option: View My Designs<br/>or Continue Editing"]
    
    style M fill:#c8e6c9
    style O fill:#fff9c4
```

## 6. Add to Cart & Checkout Flow

```mermaid
graph TD
    A["Design Complete"] --> B{{"User Choice"}}
    B -->|Add All Items| C["Add Each Item<br/>to Cart"]
    B -->|Add Individually| D["Select Items<br/>Add Selected"]
    C --> E["Update Cart Service"]
    D --> E
    E --> F["Cart Updated<br/>in Supabase"]
    F --> G["Show Confirmation:<br/>X items added"]
    G --> H{{"Next Action"}}
    H -->|Continue Designing| I["Stay in Designer"]
    H -->|Go to Cart| J["Navigate to Cart"]
    I --> K["Show Cart Count<br/>in Header"]
    J --> K
    K --> L["View Cart Items"]
    L --> M["Review Prices<br/>& Quantities"]
    M --> N["Checkout"]
    N --> O["Login/Address Entry"]
    O --> P["Select Payment"]
    P --> Q["Process Payment<br/>Stripe/GCash"]
    Q --> R["✅ Order Confirmed"]
    R --> S["Show Order Number<br/>& Delivery Date"]
    
    style R fill:#c8e6c9
    style S fill:#a5d6a7
```

## 7. Complete System Architecture

```mermaid
graph TB
    subgraph Client["Client (Browser)"]
        UI["Virtual Room Designer UI"]
        Canvas["Canvas Area<br/>React Draw"]
        Palette["Furniture Palette<br/>Drag & Drop"]
        Props["Properties Panel<br/>Position/Rotation"]
    end
    
    subgraph Server["Next.js Server"]
        SearchRoute["Search Route<br/>Products"]
        AnalysisRoute["Room Analysis Route<br/>POST /api/room-analysis"]
        SaveRoute["Save Design Route<br/>POST /api/designs"]
    end
    
    subgraph AI["AI Services"]
        OpenRouter["OpenRouter API<br/>Nemotron Model"]
    end
    
    subgraph Database["Supabase"]
        ProductsDB["Products"]
        DesignsDB["Room Designs"]
        Storage["Storage<br/>Images"]
    end
    
    subgraph External["External Services"]
        Cart["Cart Service"]
        Payment["Payment<br/>Stripe/GCash"]
    end
    
    UI --> Canvas
    UI --> Palette
    UI --> Props
    
    Palette -->|Get Products| SearchRoute
    SearchRoute -->|Query| ProductsDB
    SearchRoute -->|URLs| Storage
    
    UI -->|Upload Image| Storage
    UI -->|Send for Analysis| AnalysisRoute
    AnalysisRoute -->|Vision Analysis| OpenRouter
    OpenRouter -->|Returns Analysis| AnalysisRoute
    
    Canvas -->|Drag Operations| Palette
    Canvas -->|Placement Data| Props
    
    UI -->|Save Design| SaveRoute
    SaveRoute -->|Store Design| DesignsDB
    SaveRoute -->|Store Image| Storage
    
    UI -->|Add to Cart| Cart
    Cart -->|Store Items| Database
    Cart -->|Checkout| Payment
    
    style Client fill:#e3f2fd
    style Server fill:#f3e5f5
    style AI fill:#fff3e0
    style Database fill:#e8f5e9
    style External fill:#fce4ec
```

## 8. Data State Flow

```mermaid
graph TD
    subgraph Initial["Initial State"]
        S1["uploadedImage: null<br/>placedFurniture: []<br/>selectedFurnitureId: null"]
    end
    
    subgraph Upload["After Upload"]
        S2["uploadedImage: 'room-abc123.jpg'<br/>roomImagePath: 'designs/...'<br/>placedFurniture: []"]
    end
    
    subgraph Analysis["After AI Analysis"]
        S3["aiAnalysis: {...}<br/>recommendations: [...]<br/>furnitureData: [highlighted]"]
    end
    
    subgraph Placement["After 1st Placement"]
        S4["placedFurniture: [<br/>  {id, furnitureId,<br/>   x, y, rotation}<br/>]"]
    end
    
    subgraph AllPlaced["After Multiple Placements"]
        S5["placedFurniture: [<br/>  {item1},<br/>  {item2},<br/>  {item3},<br/>  ...<br/>]"]
    end
    
    subgraph Saved["After Save"]
        S6["currentDesignId: 'design-123'<br/>lastSaved: timestamp<br/>showSaveModal: false"]
    end
    
    Initial --> Upload
    Upload --> Analysis
    Analysis --> Placement
    Placement --> AllPlaced
    AllPlaced --> Saved
    
    style Initial fill:#ffebee
    style Upload fill:#fff3e0
    style Analysis fill:#f3e5f5
    style Placement fill:#fce4ec
    style AllPlaced fill:#e3f2fd
    style Saved fill:#e8f5e9
```

