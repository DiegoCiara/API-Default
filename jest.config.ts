/*
 * For a detailed explanation regarding each configuration property and type check, visit:
 * https://jestjs.io/docs/configuration
 */

import nameMapper from 'jest-module-name-mapper';

export default {
  clearMocks: true,
  testTimeout: 15000,
  coverageProvider: "v8",
  moduleNameMapper: nameMapper(),
  preset: 'ts-jest',
  rootDir: '.',
  testMatch: [
    "**/__tests__/**/*.spec.ts",
  ],
};
