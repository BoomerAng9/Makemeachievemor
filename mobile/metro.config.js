const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');

const config = getDefaultConfig(__dirname);

// Add support for additional file extensions
config.resolver.assetExts.push(
  // Add other asset extensions if needed
  'bin',
  'txt',
  'jpg',
  'png',
  'json',
  'svg'
);

// Add support for TypeScript and React Native extensions
config.resolver.sourceExts.push(
  'expo.ts',
  'expo.tsx',
  'expo.js',
  'expo.jsx',
  'ts',
  'tsx',
  'js',
  'jsx',
  'json'
);

// Configure alias support for absolute imports
config.resolver.alias = {
  '@': './src',
  '@/components': './src/components',
  '@/screens': './src/screens',
  '@/services': './src/services',
  '@/hooks': './src/hooks',
  '@/utils': './src/utils',
  '@/types': './src/types',
  '@/constants': './src/constants',
  '@/navigation': './src/navigation',
};

module.exports = config;