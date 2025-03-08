import globals from "globals";
import pluginJs from "@eslint/js";
import tseslint from "typescript-eslint";


/** @type {import('eslint').Linter.Config[]} */
export default [
  {
    files: ["**/*.ts"],
    ignores: ["tests/**", "__tests__/**", "dist/**"],
  },
  {languageOptions: {
    globals: globals.browser
  }},
  pluginJs.configs.recommended,
  ...tseslint.configs.recommended,
];