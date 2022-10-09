/*
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

export default {
  moduleNameMapper: { "(.+)(?<!ohm)\\.js": "$1" },
  roots: ["src"],
  setupFilesAfterEnv: ["<rootDir>/src/setupTests.ts"],
  transformIgnorePatterns: ["<rootDir>/node_modules/(?!@davidsouther/.*)"],
};
