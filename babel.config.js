module.exports = function (api) {
  const isProduction = api.env('production');
  const envFile = isProduction ? '.env.production' : '.env.development';

  return {
    // 🚨 Make sure this is first and at the top level
    presets: ['babel-preset-expo'],

    // Plugins applied to ALL environments
    plugins: [
      [
        'module-resolver',
        {
          alias: {
            '~': './',
          },
        },
      ],
      ['inline-dotenv', { path: envFile, systemVar: 'overwrite' }],
      // This MUST stay last in the list
      'react-native-reanimated/plugin',
    ],

    env: {
      production: {
        plugins: [
          // Keep the same plugin order in production
          [
            'module-resolver',
            {
              alias: {
                '~': './',
              },
            },
          ],
          ['inline-dotenv', { path: envFile, systemVar: 'overwrite' }],
          ['react-native-paper/babel'],
          ['transform-remove-console'],
          'react-native-reanimated/plugin',
        ],
      },
    },
  };
};
