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

## Environment Configuration

```
EXPO_PUBLIC_API_URL=https://your-app.replit.app
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_...
```