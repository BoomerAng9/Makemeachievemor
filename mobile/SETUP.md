# ACHIEVEMOR Mobile App Setup Guide

Your mobile app code is already installed in the `/mobile` directory. Follow these steps to get it running:

## Quick Setup Steps

### 1. Install Dependencies
```bash
cd mobile
npm install --legacy-peer-deps
```

### 2. Set Up Environment Variables
```bash
cp .env.example .env
```

Edit the `.env` file with your values:
```
EXPO_PUBLIC_API_URL=https://your-replit-app.replit.app
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_test_your_stripe_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_key
```

### 3. Install Expo CLI (if not already installed)
```bash
npm install -g @expo/cli
```

### 4. Login to Your Expo Account
```bash
expo login
```

### 5. Start Development Server
```bash
npm start
```

This will open the Expo development server. You can then:
- Scan the QR code with Expo Go app on your phone
- Press 'i' for iOS simulator
- Press 'a' for Android emulator

## What's Already Built

Your mobile app includes:
- ✅ Complete authentication system
- ✅ Driver registration flow
- ✅ Dashboard with statistics
- ✅ Job opportunities browser
- ✅ Document management (camera + file upload)
- ✅ Profile management
- ✅ Professional ACHIEVEMOR branding
- ✅ iOS/Android deployment configuration

## File Structure
```
mobile/
├── App.tsx                 # Main app component
├── src/
│   ├── screens/           # All app screens
│   ├── navigation/        # Navigation setup
│   ├── services/          # API and auth services
│   ├── constants/         # Theme and styling
│   └── components/        # Reusable components
├── eas.json              # Build configuration
├── app.json              # Expo configuration
└── package.json          # Dependencies
```

## Testing the App

1. **Web Preview**: After `npm start`, press 'w' to open in browser
2. **Mobile Device**: Install Expo Go app and scan QR code
3. **iOS Simulator**: Press 'i' (requires Xcode on Mac)
4. **Android Emulator**: Press 'a' (requires Android Studio)

## Next Steps

Once running locally:
1. Test all features
2. Configure your API endpoints
3. Set up Stripe for payments
4. Build for production: `npm run build:ios` or `npm run build:android`
5. Deploy to App Store/Play Store using the deployment guide

The mobile app is production-ready and connects to your existing ACHIEVEMOR backend API.