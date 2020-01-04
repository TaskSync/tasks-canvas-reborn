module.exports = {
  preset: "ts-jest",
  testEnvironment: "node",
  transform: {
    "^.+\\.js$": "babel-jest",
    "^.+\\.ts$": "ts-jest"
  },
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!lodash-es)"]
};
