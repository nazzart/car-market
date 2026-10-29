import { type Locator, type Page, expect } from "@playwright/test";

export const PASSWORD = "QaTest12345";

// Уникальный адрес на каждый запуск — teardown.ts удаляет все qa.e2e-* после тестов
export const qaEmail = (name: string) => `qa.e2e-${name}-${Date.now()}@bestauto-qa.lv`;

export async function register(page: Page, kind: "private" | "company", fields: { name: string; email: string; regNumber?: string }) {
  await page.goto("/");
  await page.getByRole("banner").getByRole("button", { name: "Ienākt" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.getByRole("button", { name: "Izveidot kontu" }).click();
  await dialog.getByRole("radio", { name: kind === "company" ? /Uzņēmum/ : /Privātperson/ }).click();
  await dialog.getByRole("button", { name: "Turpināt" }).click();

  const inputs = dialog.locator("input:not([type=checkbox])");
  const values = kind === "company" ? [fields.name, fields.regNumber!, fields.email, PASSWORD] : [fields.name, fields.email, PASSWORD];
  for (const [i, value] of values.entries()) await inputs.nth(i).fill(value);
  await dialog.locator("input[type=checkbox]").check();
  await dialog.locator("button[type=submit]").click();
  await expect(dialog).toBeHidden();
}

// Первое объявление из поиска — без привязки к конкретным id в базе
export async function firstListingPath(page: Page) {
  await page.goto("/cars");
  const link = page.locator('main a[href*="/listing/"]').first();
  await expect(link).toBeVisible();
  const href = await link.getAttribute("href");
  return href!.replace(/^https?:\/\/[^/]+/, "");
}

// Кнопка-переключатель (избранное, сравнение): кликнуть и дождаться aria-pressed="true".
// Повтор — если клик пришёлся до гидратации и React ещё не повесил обработчик
export async function press(button: Locator) {
  await expect(async () => {
    if ((await button.getAttribute("aria-pressed")) !== "true") await button.click();
    await expect(button).toHaveAttribute("aria-pressed", "true", { timeout: 2_000 });
  }).toPass({ timeout: 15_000 });
}

// Переключатель на странице по части текста, общей для обоих состояний («Salīdzin» — «Salīdzināt» / «Salīdzinājumā»):
// после нажатия текст меняется, а локатор должен находить ту же кнопку
export const toggle = (page: Page, text: RegExp) =>
  page.getByRole("main").locator("button[aria-pressed]").filter({ hasText: text }).first();
