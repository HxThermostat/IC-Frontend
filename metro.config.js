// const path = require('path');
// const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');

// const projectRoot = __dirname;
// const watchFolders = [path.resolve(projectRoot, '.')]; // adjust if your source is not in "src"

// const config = {
//   resolver: {
//     extraNodeModules: {
//       '~': path.resolve(projectRoot, '.'), // replace 'src' with your actual base directory
//     },
//   },
//   watchFolders,
// };

// module.exports = mergeConfig(getDefaultConfig(projectRoot), config);

const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { getDefaultConfig: getExpoConfig } = require('@expo/metro-config');

const defaultConfig = getDefaultConfig(__dirname);
const expoConfig = getExpoConfig(__dirname);

const config = mergeConfig(defaultConfig, expoConfig);

module.exports = config;