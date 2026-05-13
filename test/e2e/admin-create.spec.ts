import { test, expect } from "@playwright/test";
import "dotenv/config";

/**
 * Playwright E2E tests for the admin creation page.
 *
 * Requirements:
 * - The server must be started with the same `ADMIN_CREATION_SECRET` value
 *   that the test runner uses. Set `ADMIN_CREATION_SECRET` in your environment
 *   before starting the server and when running Playwright.
 * - Optionally set `PLAYWRIGHT_BASE_URL` to override the base URL.
 */

const BASE = process.env.PLAYWRIGHT_BASE_URL ?? "http://localhost:3000";
const ADMIN_SECRET = process.env.ADMIN_CREATION_SECRET ?? "test-secret";

const E2E_NONE_URL = `${BASE}/admin/create?e2e=none`;
const E2E_EXISTING_URL = `${BASE}/admin/create?e2e=existing`;

test.describe.serial("Admin creation flow", () => {
    test("shows the form when no admin exists and can create one", async ({
        page,
    }) => {
        const response = await page.goto(E2E_NONE_URL);
        expect(response?.status()).toBe(200);

        await expect(page.getByText("Create Admin Account")).toBeVisible();

        await page.fill("#email", `admin-e2e+${Date.now()}@example.test`);
        await page.fill("#password", "Password123!");
        await page.fill("#repeat-password", "Password123!");
        await page.fill("#secretCode", ADMIN_SECRET);

        await Promise.all([
            page.waitForURL("**/admin"),
            page.click("text=Create Account"),
        ]);

        await expect(page).toHaveURL(new RegExp(`${BASE}/admin`));
    });

    test("show error when password !== repeatPassword", async ({ page }) => {
        const response = await page.goto(E2E_NONE_URL);
        expect(response?.status()).toBe(200);

        await expect(page.getByText("Create Admin Account")).toBeVisible();

        await page.fill("#email", `admin-e2e+${Date.now()}@example.test`);
        await page.fill("#password", "Password123!");
        await page.fill("#repeat-password", "Password456??");
        await page.fill("#secretCode", ADMIN_SECRET);

        await Promise.all([
            page.waitForURL("**/admin"),
            page.click("text=Create Account"),
        ]);

        await expect(page).toHaveURL(
            new RegExp(`${BASE}/admin/create?error=password_not_match`),
        );
    });

    test("returns 404 when an admin already exists", async ({ page }) => {
        const response = await page.goto(E2E_EXISTING_URL);
        expect(response?.status()).toBe(404);
        await expect(page.getByText("404")).toBeVisible();
    });

    test("shows error query when secret is invalid", async ({ page }) => {
        const response = await page.goto(E2E_NONE_URL);
        expect(response?.status()).toBe(200);

        await expect(page.getByText("Create Admin Account")).toBeVisible();

        await page.fill("#email", `admin-e2e-bad+${Date.now()}@example.test`);
        await page.fill("#password", "Password123!");
        await page.fill("#repeat-password", "Password123!");
        await page.fill("#secretCode", "wrong-secret");

        await Promise.all([
            page.waitForURL("**/admin/create?error=1"),
            page.click("text=Create Account"),
        ]);

        await expect(page).toHaveURL(/\/admin\/create\?error=1$/);
    });
});
