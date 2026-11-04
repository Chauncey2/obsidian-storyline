import tsparser from "@typescript-eslint/parser";
import { defineConfig } from "eslint/config";
import obsidianmd from "eslint-plugin-obsidianmd";

const BRANDS = ["StoryLine", "Scrivener", "Obsidian", "Codex", "Markdown", "Cmd"];

export default defineConfig([
  {
    ignores: ["*.mjs", "main.js", "node_modules/**", ".test-build/**"],
  },
  ...obsidianmd.configs.recommended,
  {
    files: ["**/*.ts"],
    languageOptions: {
      parser: tsparser,
      parserOptions: {
        project: "./tsconfig.json",
      },
      globals: {
        activeDocument: "readonly",
        cancelAnimationFrame: "readonly",
        console: "readonly",
        createFragment: "readonly",
        crypto: "readonly",
        document: "readonly",
        getComputedStyle: "readonly",
        navigator: "readonly",
        performance: "readonly",
        window: "readonly",
      },
    },
    rules: {
      // Preserve brand names with their canonical casing in UI strings.
      "obsidianmd/ui/sentence-case": ["error", { brands: BRANDS }],
    },
  },
  {
    files: ["i18n/locales/en/**/*.ts"],
    rules: {
      "obsidianmd/ui/sentence-case-locale-module": ["error", {
        brands: BRANDS,
        acronyms: ["POV", "PDF", "DOCX", "CSV", "JSON", "HTML", "ID", "URL"],
        ignoreWords: ["English", "Chinese"],
      }],
    },
  },
  {
    files: ["tests/**/*.ts"],
    rules: {
      "import/no-nodejs-modules": "off",
      "@typescript-eslint/no-floating-promises": "off",
    },
  },
]);
