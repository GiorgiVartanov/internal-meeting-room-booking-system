import js from "@eslint/js"
import stylistic from "@stylistic/eslint-plugin"
import { defineConfig } from "eslint/config"
import importPlugin from "eslint-plugin-import"
import reactHooks from "eslint-plugin-react-hooks"
import reactRefresh from "eslint-plugin-react-refresh"
import globals from "globals"
import tseslint from "typescript-eslint"

// The plugin's legacy and flat presets have incompatible public config types.
// ESLint only needs its rule implementations because the rules are configured below.
const reactHooksPlugin = { rules: reactHooks.rules }

const hookStatement = {
  selector:
    "VariableDeclaration:has(VariableDeclarator[init.type='CallExpression'][init.callee.type='Identifier'][init.callee.name=/^use[A-Z0-9]/])",
}

const multilineArrowFunction = {
  selector: "VariableDeclaration:has(VariableDeclarator[init.type='ArrowFunctionExpression'])",
  lineMode: "multiline" as const,
}

export default defineConfig(
  {
    ignores: ["dist/**"],
  },

  js.configs.recommended,

  ...tseslint.configs.recommended,

  {
    files: ["scripts/**/*.mjs"],
    languageOptions: {
      globals: globals.node,
    },
  },

  {
    files: ["**/*.{ts,tsx}"],

    languageOptions: {
      ecmaVersion: "latest",
      globals: globals.browser,
    },

    plugins: {
      "@stylistic": stylistic,
      import: importPlugin,
      "react-hooks": reactHooksPlugin,
      "react-refresh": reactRefresh,
    },

    rules: {
      ...reactHooks.configs.recommended.rules,

      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: true,
          },
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          custom: {
            regex: "^T[A-Z]",
            match: true,
          },
        },
      ],

      "@stylistic/padding-line-between-statements": [
        "error",

        // Blank line before return
        {
          blankLine: "always",
          prev: "*",
          next: "return",
        },

        // Blank line before hook block
        {
          blankLine: "always",
          prev: "*",
          next: hookStatement,
        },

        // Blank line after hook block
        {
          blankLine: "always",
          prev: hookStatement,
          next: "*",
        },

        // Keep consecutive hooks together
        {
          blankLine: "never",
          prev: hookStatement,
          next: hookStatement,
        },

        // Single-line const -> multiline arrow function
        {
          blankLine: "always",
          prev: "singleline-const",
          next: multilineArrowFunction,
        },

        // Multiline arrow function -> single-line const
        {
          blankLine: "always",
          prev: multilineArrowFunction,
          next: "singleline-const",
        },
      ],

      "func-style": ["error", "expression", { allowArrowFunctions: true }],
      "import/no-duplicates": "error",
      "no-nested-ternary": "error",

      "import/order": [
        "error",
        {
          groups: [
            "builtin",
            "external",
            "internal",
            "parent",
            "sibling",
            "index",
            "object",
            "type",
          ],

          pathGroups: [
            {
              pattern: "@/**",
              group: "internal",
              position: "after",
            },
          ],

          pathGroupsExcludedImportTypes: ["builtin"],

          "newlines-between": "always",

          alphabetize: {
            order: "ignore",
            caseInsensitive: true,
          },
        },
      ],

      "react-refresh/only-export-components": [
        "warn",
        {
          allowConstantExport: true,
        },
      ],
    },
  },

  {
    files: ["src/components/ui/**/*.{ts,tsx}"],
    rules: {
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/naming-convention": "off",
      "func-style": "off",
      "import/order": "off",
      "react-refresh/only-export-components": "off",
    },
  }
)
