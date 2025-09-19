/* ESLint root config enforcing package import boundaries */
module.exports = {
  root: true,
  ignorePatterns: ["dist", "node_modules"],
  env: { es2022: true, node: true, browser: true },
  parser: "@typescript-eslint/parser",
  parserOptions: { sourceType: "module" },
  plugins: ["@typescript-eslint"],
  extends: [
    "eslint:recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
  ],
  rules: {
    // Disallow deep relative cross-package imports into another package's src
    "no-restricted-imports": [
      "error",
      {
        patterns: [
          "../*/src/*", // traversing up then into another package src
          "../../*/src/*",
          "../../../*/src/*",
        ],
      },
    ],
  },
};
