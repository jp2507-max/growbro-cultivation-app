import * as Crypto from 'expo-crypto';

// Polyfill for global.crypto.getRandomValues using expo-crypto
// This is required for InstantDB to work in Expo environment
if (!global.crypto) {
  // @ts-expect-error - Polyfilling global crypto object
  global.crypto = {};
}

if (!global.crypto.getRandomValues) {
  // @ts-expect-error - Polyfilling getRandomValues method
  global.crypto.getRandomValues = (array: Uint8Array) => {
    return Crypto.getRandomValues(array);
  };
}
