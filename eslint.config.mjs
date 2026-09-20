import { FlatCompat } from "@eslint/eslintrc";
import { fileURLToPath } from "url";
import path from "path";
import boundaries from "eslint-plugin-boundaries";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      ".next/**",
      "out/**",
      "build/**",
      "next-env.d.ts",
      "node_modules/**",
      "src/features/**/lib/*.test.ts",
    ],
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    plugins: {
      boundaries,
    },
    settings: {
      "boundaries/include": ["src/**/*"],
      "boundaries/elements": [
        {
          type: "app",
          pattern: "src/app/**/*",
        },
        {
          type: "feature",
          pattern: "src/features/*/**/*",
          capture: ["featureName"],
        },
        {
          type: "component",
          pattern: "src/components/**/*",
        },
        {
          type: "lib",
          pattern: "src/lib/**/*",
        },
      ],
    },
    rules: {
      "boundaries/dependencies": [
        "error",
        {
          default: "disallow",
          policies: [
            {
              from: { element: { type: "app" } },
              allow: [
                { to: { element: { type: "app" } } },
                { to: { element: { type: "feature" } } },
                { to: { element: { type: "component" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "feature" } },
              allow: [
                {
                  to: {
                    element: {
                      type: "feature",
                      captured: {
                        featureName: "{{from.captured.featureName}}",
                      },
                    },
                  },
                },
                { to: { element: { type: "component" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "component" } },
              allow: [
                { to: { element: { type: "component" } } },
                { to: { element: { type: "lib" } } },
              ],
            },
            {
              from: { element: { type: "lib" } },
              allow: [{ to: { element: { type: "lib" } } }],
            },
          ],
        },
      ],
      "no-restricted-imports": [
        "error",
        {
          patterns: [
            {
              group: ["@/features/*/*"],
              message:
                "Deep imports into features are prohibited. Import exclusively through the feature public barrel `@/features/<feature-name>`.",
            },
          ],
        },
      ],
    },
  },
  // Restrict direct Prisma access outside of features/*/services/ and lib/prisma.ts
  {
    files: [
      "src/app/**/*",
      "src/components/**/*",
      "src/features/**/components/**/*",
      "src/features/**/actions/**/*",
      "src/features/**/schemas/**/*",
      "src/features/**/lib/**/*",
    ],
    rules: {
      "no-restricted-imports": [
        "error",
        {
          paths: [
            {
              name: "@/lib/prisma",
              message:
                "Direct Prisma access is restricted exclusively to `features/*/services/`.",
            },
            {
              name: "@prisma/client",
              message:
                "Direct Prisma access is restricted exclusively to `features/*/services/`.",
            },
          ],
          patterns: [
            {
              group: ["@/features/*/*"],
              message:
                "Deep imports into features are prohibited. Import exclusively through the feature public barrel `@/features/<feature-name>`.",
            },
          ],
        },
      ],
    },
  },
];

export default eslintConfig;
