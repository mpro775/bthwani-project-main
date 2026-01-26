// babel.config.js
module.exports = function (api) {
    api.cache(true);
    return {
      presets: ['babel-preset-expo'],
      plugins: [
        [
          'module-resolver',
          {
            root: ['./src'],
            alias: { '@': './src' },
            extensions: ['.js', '.jsx', '.ts', '.tsx', '.json'],
          },
        ],
        'react-native-worklets/plugin', // يجب أن يكون الأخير
      ],
    };
  };
  