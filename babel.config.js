module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    // has to be added last
    'react-native-worklets/plugin',
  ],
  env: {
    production: {
      plugins: [
        'transform-remove-console',
        'react-native-paper/babel',
        // has to be added last
        'react-native-worklets/plugin',
      ],
    },
  },
};
