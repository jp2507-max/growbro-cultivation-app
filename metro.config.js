/* eslint-disable @typescript-eslint/no-require-imports */
const { getDefaultConfig } = require('expo/metro-config');
const { withNativeWind } = require('nativewind/metro');
const { withRorkMetro } = require('@rork-ai/toolkit-sdk/metro');

const config = getDefaultConfig(__dirname);

module.exports = withRorkMetro(
  withNativeWind(config, {
    input: './global.css',
    inlineVariables: false,
    globalClassNamePolyfill: false,
  })
);
