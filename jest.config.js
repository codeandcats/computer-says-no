module.exports = {
  clearMocks: true,
  collectCoverage: true,
  coverageDirectory: "./coverage",
  coverageProvider: "v8",
  coverageReporters: ["lcov", "text"],
  coverageThreshold: {
    global: {
      branches: 100,
      functions: 100,
      lines: 100,
      statements: 100,
    },
  },
  preset: "ts-jest",
  testEnvironment: "node",
};
