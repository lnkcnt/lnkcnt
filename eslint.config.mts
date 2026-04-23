import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

const eslintConfig = defineConfig([
    ...nextVitals,
    ...nextTs,
    // Override default ignores of eslint-config-next.
    globalIgnores([
        // Default ignores of eslint-config-next:
        ".next/**",
        "out/**",
        "build/**",
        "next-env.d.ts",
        "src/components/**",
        "drizzle/*.ts",
        "src/db/*.ts",
    ]),
    {
        name: "Default lint rules",
        plugins: {
            eslint,
            tseslint,
        },
        extends: ["eslint/recommended", "tseslint/recommended"],
        rules: {
            "@typescript-eslint/naming-convention": [
                "warn",
                {
                    selector: "function",
                    format: ["camelCase", "PascalCase"],
                },
            ],
        },
    },
]);

export default eslintConfig;
