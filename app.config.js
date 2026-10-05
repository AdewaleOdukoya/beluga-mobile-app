// Expo Go only runs updates labelled with its SDK runtime, so `EXPO_GO=1 eas update --branch expo-go`
// publishes a copy that opens in Expo Go on any phone. Store builds keep the appVersion runtime.
module.exports = ({ config }) =>
  process.env.EXPO_GO === "1" ? { ...config, runtimeVersion: `exposdk:${require("expo/package.json").version.split(".")[0]}.0.0` } : config;
