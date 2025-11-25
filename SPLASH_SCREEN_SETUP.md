# Splash Screen Setup Instructions

## ✅ Configuration Complete!

The splash screen has been configured for both Android and iOS. Now you need to add your splash screen image files.

## 📱 Image Requirements

Your splash screen image should be:
- **Format**: PNG (recommended) or JPG
- **Dimensions**: 
  - **Square format** (e.g., 512x512, 1024x1024) for the icon/logo
  - The image will be centered on a gradient background (lavender to white)

## 📂 Where to Place Your Images

### For Android:

1. **Main splash image** (splash_image.png):
   - Place in: `android/app/src/main/res/drawable/splash_image.png`
   - Recommended size: 512x512 or 1024x1024 pixels
   - This is the icon/logo that appears in the center

### For iOS:

1. **Splash image files** (3 sizes needed):
   - Place in: `ios/Design_AI/Images.xcassets/SplashImage.imageset/`
   - Files needed:
     - `splash_image.png` (1x - 200x200 pixels)
     - `splash_image@2x.png` (2x - 400x400 pixels)
     - `splash_image@3x.png` (3x - 600x600 pixels)

## 🎨 Current Design

The splash screen is configured with:
- **Background**: Gradient from light lavender (#E6E6FA) at top to white at bottom
- **App Name**: "Visuals AI" (displayed below the icon)
- **Layout**: Centered icon with app name below

## 🚀 After Adding Images

1. **For Android**: Rebuild the app
   ```bash
   npm run android
   ```

2. **For iOS**: 
   - Open Xcode: `ios/Design_AI.xcodeproj`
   - Clean build folder (Cmd+Shift+K)
   - Rebuild the app

## 📝 Notes

- The Android splash screen uses a drawable resource that includes the gradient background
- The iOS splash screen uses a storyboard with the gradient background
- Both platforms will show the splash screen immediately when the app launches
- The splash screen will automatically hide when React Native loads

## 🔧 Customization

If you want to change:
- **Background colors**: Edit `android/app/src/main/res/drawable/splash_screen.xml` and `ios/Design_AI/LaunchScreen.storyboard`
- **App name**: Edit `ios/Design_AI/LaunchScreen.storyboard` (line with "Visuals AI" text)
- **Image size/position**: Adjust constraints in the storyboard and drawable XML

