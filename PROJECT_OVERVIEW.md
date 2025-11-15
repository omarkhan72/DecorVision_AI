# Design AI - Complete Project Overview

## 📱 Project Summary
**Design AI** is a React Native mobile application that uses AI to transform interior and exterior spaces. Users can upload photos of their rooms, select room types and styles, and generate AI-powered design transformations.

---

## 🏗️ Project Structure

```
Design_AI/
├── android/                    # Android native code
│   └── app/
│       ├── google-services.json  # Firebase config
│       └── src/main/
│           └── AndroidManifest.xml
├── ios/                        # iOS native code
├── functions/                  # Firebase Cloud Functions
│   ├── index.js               # Functions entry point (currently empty)
│   └── package.json
├── src/
│   ├── assets/
│   │   └── images/             # Static image assets
│   ├── components/             # Reusable components (empty)
│   ├── contexts/               # React contexts (empty)
│   ├── navigations/            # Navigation setup
│   │   └── RootNavigator.tsx   # (currently empty)
│   ├── screens/                # All app screens
│   │   ├── HomeScreen.tsx
│   │   ├── InteriorUploadScreen.tsx
│   │   ├── RoomTypeSelectionScreen.tsx
│   │   ├── InteriorStyleSelectionScreen.tsx
│   │   ├── DesignResultScreen.tsx
│   │   ├── DesignScreen.tsx
│   │   ├── InteriorsListScreen.tsx
│   │   ├── ExteriorsListScreen.tsx
│   │   ├── StyleDetailScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── SubscriptionScreen.tsx
│   │   └── SettingsScreen.tsx
│   └── utils/
│       └── Adjust.tsx
├── App.tsx                     # Main app entry point
├── package.json                # Dependencies
├── firebase.json               # Firebase config
└── .firebaserc                 # Firebase project: ai-visuals-app
```

---

## 🎯 Application Flow & Screen Navigation

### **Main Navigation Structure**
The app uses a **state-based navigation system** managed in `HomeScreen.tsx` with three main tabs:
- **Home** (default)
- **Design**
- **History**

### **Complete Screen Flow**

#### **1. Home Tab (HomeScreen.tsx)**
- **Purpose**: Main entry point with feature cards
- **Features**:
  - Header with "Dream Ai" logo, Pro button, Settings button
  - Category navigation (Interior Design, Exterior Design, Garden Design)
  - 8 feature cards (Interior Design, Exterior Design, Garden Design, Replace, Style Transfer, New walls, New Flooring, Cleanup)
  - Bottom navigation tabs (Home, Design, History)

**Navigation from Home:**
- Click any feature card → `InteriorUploadScreen`
- Click Pro button → `SubscriptionScreen`
- Click Settings → `SettingsScreen`

---

#### **2. Design Generation Flow (3-Step Process)**

**Step 1: InteriorUploadScreen.tsx**
- **Purpose**: Upload or take a photo of the room
- **Features**:
  - Upload photo button (gallery)
  - Take photo button (camera)
  - Image preview with "Remove" and "Change Photo" options
  - Sample images grid (4 images)
  - If coming from `StyleDetailScreen`, first sample shows selected style image
  - Progress indicator: "Step 1/3"
  - Continue button (disabled until image selected)

**Navigation:**
- Back/Close → `HomeScreen` (Tabs)
- Continue → `RoomTypeSelectionScreen`

---

**Step 2: RoomTypeSelectionScreen.tsx**
- **Purpose**: Select room type
- **Features**:
  - Grid of 13 room types:
    - Living Room, Bedroom, Kitchen, Bathroom
    - Dining Room, Entryway, Office, Home Office
    - Study Room, Gaming Room, Coffee Shop, Attic, Other
  - Selectable buttons with visual feedback (purple border when selected)
  - Progress indicator: "Step 2/3"
  - Continue button (disabled until room selected)

**Navigation:**
- Back → `InteriorUploadScreen`
- Close → `InteriorUploadScreen`
- Continue → `InteriorStyleSelectionScreen`

---

**Step 3: InteriorStyleSelectionScreen.tsx**
- **Purpose**: Select interior design style
- **Features**:
  - Grid of 12 circular style images:
    - Modern, Cozy, Luxury, Minimalist
    - Scandinavian, Airbnb, Mid Century, Rustic
    - Zen, Tropical, Coastal, Vintage
  - Purple circular border around selected style
  - Style name changes color/weight when selected
  - Progress indicator: "Step 3/3"
  - "Generate Now" button (disabled until style selected)

**Navigation:**
- Back → `RoomTypeSelectionScreen`
- Close → `RoomTypeSelectionScreen`
- Generate Now → `DesignResultScreen` ⚠️ **Needs API integration**

---

#### **3. Design Result Screen**

**DesignResultScreen.tsx**
- **Purpose**: Display generated design and provide actions
- **Features**:
  - Header with Pro badge, "Your design" title, close button
  - Main generated image display
  - Feedback bar (thumbs up/down) + "Remove watermark" button
  - "Regenerate" button
  - "Download" button (saves to device Pictures folder)
  - "Share" button (native share sheet)
  - Currently shows placeholder image (needs API integration)

**Navigation:**
- Close → `HomeScreen` (Tabs)

**Functionality:**
- ✅ Download: Uses `react-native-fs` + permissions
- ✅ Share: Uses `react-native-share`
- ⚠️ Regenerate: Needs API call
- ⚠️ Image display: Needs to show generated image from API

---

#### **4. Design Tab Flow**

**DesignScreen.tsx**
- **Purpose**: Browse design templates/inspirations
- **Features**:
  - "Interior Inspiration's" section with card (82 Living Room designs)
  - "Exterior Inspiration's" section with card (75 House designs)
  - "See all" links

**Navigation:**
- Click Interior card → `InteriorsListScreen`
- Click Exterior card → `ExteriorsListScreen`

---

**InteriorsListScreen.tsx**
- **Purpose**: Browse interior design inspirations by room type
- **Features**:
  - Horizontal scrollable sections:
    - Living Room (3 images)
    - Bedroom (3 images)
    - Kitchen (3 images)
    - Bathroom (3 images)
    - Dining Room (3 images)
  - Each image is clickable

**Navigation:**
- Back → `DesignScreen` (via HomeScreen state)
- Click any image → `StyleDetailScreen` (passes image + roomName)

---

**ExteriorsListScreen.tsx**
- **Purpose**: Browse exterior design inspirations by type
- **Features**:
  - Horizontal scrollable sections:
    - Home (3 images)
    - Office (3 images)
    - Yard (3 images)
    - Swimming pool (3 images)
    - Villa (3 images)
  - Each image is clickable

**Navigation:**
- Back → `DesignScreen` (via HomeScreen state)
- Click any image → `StyleDetailScreen` (passes image + roomName)

---

**StyleDetailScreen.tsx**
- **Purpose**: View a selected style image in detail
- **Features**:
  - Header with Pro badge, "Your design" title, close button
  - Large image display with expand/move icon
  - "Room: [Room Name]" label
  - "Try This style" button

**Navigation:**
- Back/Close → `HomeScreen` (Tabs)
- Try This style → `InteriorUploadScreen` (passes style image as first sample)

---

#### **5. History Tab**

**HistoryScreen.tsx**
- **Purpose**: View previously generated designs
- **Features**:
  - "History" title with "Select" pill button
  - Grid of 4 images (2x2 layout)
  - Click image → Full-screen modal preview
  - Select mode: Toggle selection, delete selected (currently placeholder)
  - Full-screen image modal with close button

**Current State:**
- ✅ Image preview modal works
- ⚠️ Selection mode UI exists but delete is placeholder
- ⚠️ Images are hardcoded (needs Firestore integration)

**Navigation:**
- Close modal → Back to grid

---

#### **6. Settings & Subscription**

**SettingsScreen.tsx**
- **Purpose**: App settings and account management
- **Features**:
  - "Unlimited Transformations" header card with "Upgrade Now" button
  - Settings options:
    - Language, Feedback, FAQ, Rate us
    - Terms of use, Privacy Policy, Restore Purchase
  - User ID display (currently hardcoded: "fdB4DMxRs07...")

**Navigation:**
- Back → `HomeScreen` (Tabs)
- Upgrade Now → `SubscriptionScreen`

---

**SubscriptionScreen.tsx**
- **Purpose**: Subscription plans and payment
- **Features**:
  - Hero image with "Interior Design" title
  - Feature list:
    - Access to All Feature
    - Unlimited Home Transformations
    - Unlock Trending Style
    - Priority Access to New Content
    - No Ads, No Watermarks
  - Three subscription plans:
    - **Lifetime**: Rs 13,900.00 (BEST VALUE)
    - **1 Year**: Rs 8,300.00 (Save 90%)
    - **1 Week**: Rs 1,650.00 (MOST POPULAR)
  - "Continue" button
  - "Auto-renewable. Cancel anytime" text
  - User Agreement & Privacy Policy links

**Navigation:**
- Close → `HomeScreen` (Tabs)
- Continue → ⚠️ Needs payment integration

---

## 🔧 Technical Stack

### **Frontend (React Native)**
- **Framework**: React Native 0.82.1
- **Language**: TypeScript
- **Navigation**: Custom state-based (managed in HomeScreen)
- **Styling**: StyleSheet (inline styles)
- **Icons**: `react-native-vector-icons` (FontAwesome, MaterialCommunityIcons)
- **Animations**: `react-native-reanimated` v4.1.3
- **Worklets**: `react-native-worklets` (for animations)

### **Key Dependencies**
```json
{
  "@react-native-firebase/app": "^23.5.0",
  "@react-native-firebase/auth": "^23.5.0",
  "@react-native-firebase/firestore": "^23.5.0",
  "@react-native-firebase/functions": "^23.5.0",
  "react-native-image-picker": "^8.2.1",      // Photo upload/capture
  "react-native-fs": "^2.20.0",               // File system (download)
  "react-native-share": "^12.2.1",            // Share functionality
  "react-native-permissions": "^5.4.4",       // Permissions handling
  "axios": "^1.13.1",                          // HTTP requests
  "react-native-safe-area-context": "^5.6.2"  // Safe area handling
}
```

### **Backend (Firebase)**
- **Project**: `ai-visuals-app`
- **Functions**: Node.js 22, Firebase Functions v6
- **Current State**: Functions folder exists but no active functions
- **Services Needed**:
  - Firestore (database)
  - Firebase Storage (image storage)
  - Cloud Functions (API endpoints)
  - Authentication

---

## 📊 Data Flow & API Requirements

### **Current State**
- ✅ UI/UX complete
- ✅ Image upload/capture working
- ✅ Download/share working
- ⚠️ **No backend integration yet**

### **Required API Endpoints** (to be implemented in Firebase Functions)

#### **1. Create Design (`createDesign`)**
**Trigger**: When user clicks "Generate Now" in `InteriorStyleSelectionScreen`

**Input:**
```typescript
{
  userId: string,              // Firebase Auth user ID
  roomImage: string,            // Base64 or Storage URL of uploaded room photo
  roomType: string,             // e.g., "Living Room", "Bedroom"
  style: string,               // e.g., "modern", "cozy", "luxury"
  styleImage?: string          // Optional: URL of selected style image
}
```

**Process:**
1. Upload room image to Firebase Storage
2. Generate prompt based on roomType + style
3. Call image generation API (Replicate/Stability/OpenAI)
4. Save generated image to Firebase Storage
5. Create Firestore document with status: "processing"
6. Return design ID

**Output:**
```typescript
{
  designId: string,
  status: "processing" | "completed" | "failed",
  estimatedTime?: number
}
```

---

#### **2. Get Design Status (`getDesignStatus`)**
**Trigger**: Polling from `DesignResultScreen` while status is "processing"

**Input:**
```typescript
{
  designId: string,
  userId: string
}
```

**Output:**
```typescript
{
  status: "processing" | "completed" | "failed",
  imageUrl?: string,           // Firebase Storage URL when completed
  error?: string               // Error message if failed
}
```

---

#### **3. List History (`listHistory`)**
**Trigger**: When `HistoryScreen` loads

**Input:**
```typescript
{
  userId: string,
  limit?: number,              // Default: 20
  offset?: number              // For pagination
}
```

**Output:**
```typescript
{
  designs: Array<{
    designId: string,
    imageUrl: string,
    roomType: string,
    style: string,
    createdAt: timestamp,
    thumbnailUrl?: string
  }>,
  total: number
}
```

---

#### **4. Delete History (`deleteHistory`)**
**Trigger**: When user deletes selected images in `HistoryScreen`

**Input:**
```typescript
{
  userId: string,
  designIds: string[]          // Array of design IDs to delete
}
```

**Output:**
```typescript
{
  success: boolean,
  deletedCount: number
}
```

---

## 🗄️ Firestore Database Structure

### **Collection: `designs`**
```typescript
{
  designId: string,            // Auto-generated document ID
  userId: string,              // Firebase Auth UID
  roomImageUrl: string,        // Firebase Storage URL
  roomType: string,            // "Living Room", "Bedroom", etc.
  style: string,               // "modern", "cozy", etc.
  styleImageUrl?: string,      // Optional style reference image
  generatedImageUrl?: string,  // Generated design image URL
  status: "processing" | "completed" | "failed",
  createdAt: Timestamp,
  updatedAt: Timestamp,
  error?: string               // Error message if failed
}
```

### **Collection: `users`** (optional, for subscription tracking)
```typescript
{
  userId: string,
  subscriptionType?: "lifetime" | "year" | "week",
  subscriptionExpiresAt?: Timestamp,
  createdAt: Timestamp
}
```

---

## 🖼️ Firebase Storage Structure

```
gs://ai-visuals-app.appspot.com/
├── uploads/
│   └── {userId}/
│       └── {timestamp}_{filename}     # User uploaded room photos
├── generated/
│   └── {userId}/
│       └── {designId}_{timestamp}.jpg # Generated design images
└── styles/
    └── {styleId}.jpg                   # Style reference images (optional)
```

---

## 🔐 Security Rules (to be implemented)

### **Firestore Rules**
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /designs/{designId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == resource.data.userId;
    }
    match /users/{userId} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
  }
}
```

### **Storage Rules**
```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /uploads/{userId}/{allPaths=**} {
      allow read, write: if request.auth != null && 
        request.auth.uid == userId;
    }
    match /generated/{userId}/{allPaths=**} {
      allow read: if request.auth != null;
      allow write: if false; // Only Cloud Functions can write
    }
  }
}
```

---

## 🚀 Implementation Checklist

### **Backend (Firebase Functions)**
- [ ] Set up image generation API integration (Replicate/Stability/OpenAI)
- [ ] Implement `createDesign` function
- [ ] Implement `getDesignStatus` function
- [ ] Implement `listHistory` function
- [ ] Implement `deleteHistory` function
- [ ] Set up Firestore database structure
- [ ] Configure Firebase Storage
- [ ] Set up security rules
- [ ] Add error handling and logging
- [ ] Add rate limiting for API calls

### **Frontend Integration**
- [ ] Connect `InteriorStyleSelectionScreen` → `createDesign` API
- [ ] Add loading state in `DesignResultScreen` while processing
- [ ] Poll `getDesignStatus` until completed
- [ ] Display generated image in `DesignResultScreen`
- [ ] Connect `HistoryScreen` → `listHistory` API
- [ ] Implement delete functionality in `HistoryScreen`
- [ ] Add Firebase Auth integration
- [ ] Handle authentication state
- [ ] Add error handling and user feedback

### **Additional Features**
- [ ] Implement subscription/payment system
- [ ] Add watermark removal functionality
- [ ] Implement feedback (thumbs up/down) storage
- [ ] Add analytics tracking
- [ ] Implement push notifications for completed designs

---

## 📝 Notes

1. **Navigation**: Currently uses state-based navigation in `HomeScreen.tsx`. Consider migrating to `@react-navigation/native` for better scalability.

2. **Image Generation**: You'll need to choose an image generation service:
   - **Replicate**: Easy API, supports many models
   - **Stability AI**: Good quality, direct API
   - **OpenAI DALL-E**: High quality, but more expensive

3. **Prompt Engineering**: The prompt should combine:
   - Room type context
   - Selected style
   - User's uploaded room image (for style transfer)

4. **Async Processing**: Image generation can take 10-60 seconds. Use:
   - Firestore real-time listeners for status updates
   - Or polling every 2-3 seconds

5. **Image Storage**: Consider generating thumbnails for the History screen to improve performance.

---

## 🎨 Design System

- **Primary Color**: `#8B5CF6` (Purple)
- **Secondary Color**: `#1A1A1A` (Black)
- **Background**: `#FFFFFF` (White) / `#F7F8FB` (Light Gray)
- **Text**: `#1A1A1A` (Primary), `#6B7280` (Secondary)
- **Border**: `#E5E7EB` (Light Gray)
- **Font**: System default (San Francisco on iOS, Roboto on Android)

---

## 📱 Platform Support

- **Android**: ✅ Configured (package: `com.design_ai`)
- **iOS**: ✅ Configured
- **Firebase**: ✅ Connected (project: `ai-visuals-app`)

---

This overview provides a complete understanding of your project structure, flow, and requirements for backend implementation. Ready to start building the Firebase Functions! 🚀

