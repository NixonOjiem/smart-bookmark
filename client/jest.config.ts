import type { Config } from "jest";
import nextJest from "next/jest.js";

const createJestConfig = nextJest({
  // path to load next.config.js and .env files
  dir: "./",
});

// custom config to be passed to Jest
const config: Config = {
  coverageProvider: "v8",
  testEnvironment: "jsdom",
  setupFilesAfterEnv: ["<rootDir>/jest.setup.js"],
  // Handle module aliases
  moduleNameMapper: {
    "^@/(.*)$": "<rootDir>/src/$1",
  },
};

//  to ensure that next/jest can load the Next.js config which is async
export default createJestConfig(config);
