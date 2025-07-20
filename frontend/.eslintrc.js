module.exports = {
  extends: ["react-app", "react-app/jest"],
  rules: {
    "react-hooks/exhaustive-deps": "off",
    "@typescript-eslint/no-non-null-assertion": "off",
    "@typescript-eslint/no-inferrable-types": "off",
    "@typescript-eslint/no-unused-vars": "off",
    "@typescript-eslint/no-explicit-any": "off",
    "react/prop-types": "off",
  },
};