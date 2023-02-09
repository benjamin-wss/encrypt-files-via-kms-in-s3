module.exports = {
  env: {
    commonjs: true,
    es2021: true,
    node: true,
  },
  extends: ["airbnb-base", "plugin:prettier/recommended"],
  parserOptions: {
    ecmaVersion: "latest",
  },
  rules: {
    // since central logging will not be available, console log will be used to record actions.
    "no-console": "off",
    // I don't think this is a good rule lol
    "no-await-in-loop": "off",
  },
};
