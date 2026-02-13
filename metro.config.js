/* eslint-disable @typescript-eslint/no-require-imports -- Metro config is CommonJS */

const { withNativeWind } = require('nativewind/metro');
const { withRorkMetro } = require('@rork-ai/toolkit-sdk/metro');
const { getSentryExpoConfig } = require('@sentry/react-native/metro');

const config = getSentryExpoConfig(__dirname);

module.exports = withRorkMetro(
  withNativeWind(config, {
    input: './global.css',
    inlineVariables: false,
    globalClassNamePolyfill: false,
  })
);
