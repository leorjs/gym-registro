import { expect, test } from "playwright/test";

test("muestra el portal de login mobile-first", async ({ page }) => {
  await page.goto("/login");
  await expect(page.getByRole("heading", { name: "Entrá a tu registro" })).toBeVisible();
  await expect(page.getByRole("button", { name: /Entrar/ })).toBeVisible();
});
