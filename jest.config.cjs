module.exports = {
  clearMocks: true,
  collectCoverageFrom: [
    "src/shared/middlewares/autenticacao.middleware.ts",
    "src/shared/utils/jwt.ts",
  ],
  coverageReporters: ["text", "lcov", "json-summary"],
  moduleFileExtensions: ["ts", "js", "json"],
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
  setupFiles: ["<rootDir>/jest.setup.js"],
  testEnvironment: "node",
  testMatch: ["<rootDir>/src/**/*.test.ts", "<rootDir>/tests/**/*.test.ts"],
  transform: {
    "^.+\\.ts$": "babel-jest",
  },
};
