const { withRozenite } = require('@rozenite/metro');
const { getDefaultConfig } = require('@react-native/metro-config');
const { withSentryConfig } = require('@sentry/react-native/metro');
const {
  withRozeniteReduxDevTools,
} = require('@rozenite/redux-devtools-plugin/metro');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = getDefaultConfig(__dirname);

module.exports = withRozenite(withSentryConfig(config), {
  enabled: process.env.WITH_ROZENITE === 'true',
  enhanceMetroConfig: config => withRozeniteReduxDevTools(config),
});
