/* eslint-disable @typescript-eslint/no-require-imports -- Metro config is CommonJS */

const { withUniwindConfig } = require('uniwind/metro');
const { withRorkMetro } = require('@rork-ai/toolkit-sdk/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = withUniwindConfig(withRorkMetro(config), {
  cssEntryFile: './global.css',
  polyfills: { rem: 14 },
});
