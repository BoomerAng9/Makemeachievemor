# ACHIEVEMOR Mobile App - Deployment Guide

This guide covers the deployment process for the ACHIEVEMOR mobile application to both iOS App Store and Google Play Store.

## Prerequisites

### Development Environment
- Node.js 18+ installed
- Expo CLI installed globally (`npm install -g @expo/cli`)
- EAS CLI installed globally (`npm install -g eas-cli`)
- iOS: Xcode 14+ (for iOS development)
- Android: Android Studio with SDK 33+ (for Android development)

### Accounts Required
- **Expo Account**: Sign up at https://expo.dev
- **Apple Developer Account**: $99/year - Required for iOS App Store
- **Google Play Developer Account**: $25 one-time fee - Required for Google Play Store

## Initial Setup

### 1. Environment Configuration
```bash
cd mobile
cp .env.example .env
```

Edit `.env` file with your production values:
```
EXPO_PUBLIC_API_URL=https://your-production-api.replit.app
EXPO_PUBLIC_STRIPE_PUBLIC_KEY=pk_live_your_live_stripe_key
EXPO_PUBLIC_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

### 2. Install Dependencies
```bash
npm install
```

### 3. EAS Authentication
```bash
eas login
eas build:configure
```

## Development Builds

### Local Development
```bash
# Start development server
npm start

# Run on iOS simulator
npm run ios

# Run on Android emulator
npm run android
```

### Preview Builds
```bash
# Build for internal testing
eas build --platform ios --profile preview
eas build --platform android --profile preview
```

## Production Deployment

### iOS App Store Deployment

#### 1. Update App Configuration
Update `app.json`:
- Increment `version` and `ios.buildNumber`
- Ensure `ios.bundleIdentifier` is unique
- Configure `ios.infoPlist` permissions

#### 2. Build for Production
```bash
eas build --platform ios --profile production
```

#### 3. Submit to App Store
```bash
eas submit --platform ios
```

#### 4. App Store Connect
1. Log into App Store Connect
2. Complete app metadata:
   - App description
   - Keywords
   - Screenshots (required sizes: 6.7", 6.5", 5.5", 12.9")
   - App icon (1024x1024)
3. Set pricing and availability
4. Submit for review

### Google Play Store Deployment

#### 1. Update App Configuration
Update `app.json`:
- Increment `version` and `android.versionCode`
- Ensure `android.package` is unique
- Configure `android.permissions`

#### 2. Build for Production
```bash
eas build --platform android --profile production
```

#### 3. Submit to Google Play
```bash
eas submit --platform android
```

#### 4. Google Play Console
1. Log into Google Play Console
2. Complete store listing:
   - App description
   - Screenshots (phone, tablet, TV if applicable)
   - Feature graphic (1024x500)
   - App icon (512x512)
3. Set up content rating
4. Configure pricing and distribution
5. Release to production

## Required Assets

### App Icons
- **iOS**: 1024x1024 PNG (no transparency)
- **Android**: 512x512 PNG

### Screenshots
- **iOS**: 
  - iPhone 6.7" (1290x2796)
  - iPhone 6.5" (1242x2688)
  - iPhone 5.5" (1242x2208)
  - iPad 12.9" (2048x2732)
- **Android**:
  - Phone (16:9 or 9:16 aspect ratio)
  - 7-inch tablet (optional)
  - 10-inch tablet (optional)

### Store Descriptions

#### Short Description (80 characters)
"ACHIEVEMOR: Driver onboarding & job opportunities for independent contractors"

#### Full Description Template
```
ACHIEVEMOR Mobile - Your Gateway to Professional Driving Opportunities

Comprehensive onboarding platform designed specifically for owner operator independent contractors in the transportation industry.

KEY FEATURES:
✓ Streamlined driver registration and verification
✓ Real-time job opportunities with competitive pay
✓ Document management and compliance tracking
✓ Background check integration
✓ Location-based opportunity matching
✓ Professional development resources

SECURE & VERIFIED:
- Complete background verification process
- Document encryption and secure storage
- GDPR and privacy compliant
- Professional vetting of all opportunities

DESIGNED FOR DRIVERS:
- Intuitive mobile interface
- Offline access to critical features
- Push notifications for new opportunities
- Real-time application tracking

Join thousands of verified drivers who trust ACHIEVEMOR for their professional growth and income opportunities.

Download now and start your journey with verified, high-paying driving opportunities.
```

## Environment-Specific Configurations

### Development
- API: Development server
- Payments: Stripe test keys
- Analytics: Test environment
- Push notifications: Development certificates

### Staging
- API: Staging server
- Payments: Stripe test keys
- Analytics: Staging environment
- Push notifications: Development certificates

### Production
- API: Production server
- Payments: Stripe live keys
- Analytics: Production environment
- Push notifications: Production certificates

## Security Considerations

### API Keys
- Never commit API keys to version control
- Use Expo's secure environment variables
- Rotate keys regularly
- Use different keys for development/production

### App Security
- Enable certificate pinning for API calls
- Implement proper authentication flows
- Secure local data storage
- Regular security audits

## Monitoring and Analytics

### Crash Reporting
- Sentry integration for crash reporting
- Performance monitoring
- User session tracking

### App Store Optimization (ASO)
- Regular keyword optimization
- A/B testing of screenshots and descriptions
- Monitor app store rankings
- Respond to user reviews promptly

## Release Process

### Version Numbering
- Follow semantic versioning (MAJOR.MINOR.PATCH)
- iOS: Increment buildNumber for each build
- Android: Increment versionCode for each build

### Release Checklist
- [ ] Update version numbers
- [ ] Test on physical devices
- [ ] Verify API endpoints
- [ ] Test payment flows
- [ ] Check all permissions
- [ ] Generate signed builds
- [ ] Submit to stores
- [ ] Update release notes
- [ ] Monitor for issues

## Support and Maintenance

### Post-Launch
- Monitor crash reports and user feedback
- Regular updates for security patches
- Feature updates based on user requests
- Performance optimization

### App Store Management
- Respond to user reviews within 24-48 hours
- Monitor download metrics and user engagement
- A/B testing for app store assets
- Regular updates to maintain store ranking

## Troubleshooting

### Common Build Issues
- **Certificate errors**: Ensure development certificates are valid
- **Bundle ID conflicts**: Use unique bundle identifiers
- **Asset size limits**: Optimize images and remove unused assets
- **Permission errors**: Verify all required permissions are declared

### Store Rejection Issues
- **Incomplete metadata**: Ensure all required fields are filled
- **Invalid screenshots**: Use correct dimensions and content
- **Policy violations**: Review store guidelines carefully
- **Technical issues**: Test thoroughly before submission

For additional support, contact the development team or refer to Expo documentation.