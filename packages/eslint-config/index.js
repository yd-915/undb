module.exports = {
  "env": {
    "browser": true,
    "amd": true,
    "node": true,
  },
  extends: ['eslint:recommended', 'plugin:@typescript-eslint/recommended', "prettier"],
  ignorePatterns: ['node_modules', 'dist'],
  parser: '@typescript-eslint/parser',
  plugins: ['@typescript-eslint', 'eslint-plugin-tsdoc'],
  rules: {
    "react/jsx-key": "off",
    "tsdoc/syntax": "warn",
    "@typescript-eslint/consistent-type-imports": "warn",
    "@typescript-eslint/prefer-optional-chain": "warn",
  },
};
