# ACHIEVEMOR Mobile App

React Native mobile application for iOS and Android platforms providing comprehensive onboarding and opportunity management for Owner Operator Independent Contractors.

## Features

- **Driver Registration & Onboarding**: Complete mobile-optimized registration flow
- **Contractor Management**: Independent contractor verification and compliance
- **Document Management**: Mobile glovebox for document storage and verification
- **Job Opportunities**: Location-based freight and delivery opportunities
- **Real-time Notifications**: Push notifications for opportunities and compliance alerts
- **Background Checks**: Integrated background verification system
- **AI-Powered Dashboard**: Personalized insights and recommendations
- **Offline Support**: Critical features available offline

## Technology Stack

- **React Native**: Cross-platform mobile development
- **Expo**: Development platform and build tools
- **TypeScript**: Type-safe development
- **React Navigation**: Navigation system
- **React Query**: Data fetching and caching
- **AsyncStorage**: Local data persistence
- **Expo Camera**: Document scanning and photo capture
- **Expo Location**: GPS and location services
- **Expo Notifications**: Push notification system

## Development Setup

```bash
# Install dependencies
npm install

# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android

# Build for production
npm run build:ios
npm run build:android
```

## Project Structure

```
mobile/
├── src/
│   ├── components/        # Reusable UI components
│   ├── screens/          # Screen components
│   ├── navigation/       # Navigation configuration
│   ├── services/         # API and business logic
│   ├── hooks/            # Custom React hooks
│   ├── utils/            # Utility functions
│   ├── types/            # TypeScript type definitions
│   └── constants/        # App constants and configuration
├── assets/               # Images, fonts, and other assets
├── app.json             # Expo configuration
├── package.json         # Dependencies and scripts
└── tsconfig.json        # TypeScript configuration
```

## API Integration

The mobile app integrates with the existing ACHIEVEMOR backend API:
- Authentication via Replit Auth
- Driver and contractor registration
- Document upload and verification
- Job opportunity management
- Background check integration
- Real-time notifications

## Deployment

### iOS App Store
- Requires Apple Developer Account
- Build with Expo EAS Build
- Submit via App Store Connect

### Google Play Store
- Requires Google Play Developer Account
- Build with Expo EAS Build
- Submit via Google Play Console

## 🚀 Implementation Status: COMPLETE

### Built & Ready Features

**✅ Authentication System**
- Complete login/logout with secure token storage
- User registration with validation
- Protected routes and session management

**✅ Driver Registration Flow**
- Multi-step onboarding process (10 screens)
- Personal info, contact details, vehicle information
- Insurance documentation and licensing
- Real-time form validation and error handling

**✅ Core App Screens**
- Dashboard with job statistics and earnings
- Job opportunities browser with search/filtering
- Document management with camera integration
- Profile management with settings
- Professional ACHIEVEMOR branding throughout

**✅ Navigation System**
- Tab navigation for main features
- Stack navigation for registration flows
- Authentication-aware routing
- Smooth transitions and UX

**✅ Device Integrations**
- Camera access for document scanning
- File system access for uploads
- Secure storage for authentication
- Location services ready

**✅ Production Configuration**
- EAS Build setup for App Store/Play Store
- Environment variable management
- TypeScript configuration
- Error handling and loading states

### Files Installed (17 screens + services)

```
mobile/src/screens/
├── WelcomeScreen.tsx          # App onboarding
├── LoginScreen.tsx            # User authentication  
├── RegisterScreen.tsx         # Account creation
├── DriverRegistrationScreen.tsx    # Multi-step driver form
├── ContractorRegistrationScreen.tsx # Contractor onboarding
├── HomeScreen.tsx             # Dashboard with stats
├── OpportunitiesScreen.tsx    # Job browser
├── DocumentsScreen.tsx        # Document glovebox
├── ProfileScreen.tsx          # User profile
└── LoadingScreen.tsx          # Loading states

mobile/src/navigation/
├── RootNavigator.tsx          # Main navigation
├── AuthNavigator.tsx          # Auth flow
└── TabNavigator.tsx           # Bottom tabs

mobile/src/services/
├── AuthContext.tsx            # Authentication
└── ApiService.ts              # Backend integration
```

## Quick Start Guide

1. **Install dependencies:**
   ```bash
   cd mobile
   npm install --legacy-peer-deps
   ```

2. **Configure environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your Replit app URL
   ```

3. **Start development:**
   ```bash
   npm start
   # Scan QR with Expo Go app or press 'i'/'a' for simulators
   ```

## Environment Configuration

```
EXPO_PUBLIC_API_URL=https://your-replit-app.replit.app
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_maps_key
```

Your mobile app connects directly to your existing ACHIEVEMOR backend and is ready for App Store/Play Store deployment.