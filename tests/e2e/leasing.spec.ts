import { expect, test } from "@playwright/test";

import { qaEmail, qaRegNumber, register } from "./helpers";

// Дилер видит блок лизинга в форме подачи; взнос и срок — после платежа, срок — 6–120 мес.
test("sell form: leasing block for dealers", async ({ page }) => {
  await register(page, "company", { name: "QA E2E Līzings", email: qaEmail("leasing"), regNumber: qaRegNumber() });
  await page.goto("/sell?category=car");

  await expect(page.getByText(/^Līzings ·/)).toBeVisible();
  const monthly = page.getByLabel("Mēneša maksājums");
  const months = page.getByLabel("Termiņš");
  const addTerms = page.getByRole("button", { name: /Pievienot nosacījumus/ });
  // по умолчанию — только платёж в месяц; условия — по ссылке, когда платёж указан
  await expect(months).toHaveCount(0);
  await expect(addTerms).toBeDisabled();

  await monthly.fill("320");
  await addTerms.click();
  await expect(months).toBeEnabled();
  await months.fill("200");
  await expect(page.getByText("6–120")).toBeVisible();
  await months.fill("60");
  await expect(page.getByText("6–120")).toHaveCount(0);
});

// На карточках /cars — «Līzingā no … €/mēn.» с условиями в подсказке
test("cars list shows the monthly leasing price under the price", async ({ page }) => {
  await page.goto("/cars");
  const line = page.locator("main article").getByText(/^Līzingā no .+ €\/mēn\.$/).first();
  await expect(line).toBeVisible();
  await expect(line).toHaveAttribute("title", /pirmā iemaksa \d+%, \d+ mēn\./);
});

// Страница объявления: лизинг под ценой — платёж, первый взнос в % и €, срок
test("listing page shows the leasing offer near the price", async ({ page }) => {
  await page.goto("/cars");
  const card = page.locator("main article").filter({ hasText: /Līzingā no/ }).first();
  await card.locator('a[href*="/listing/"]').first().click();
  await expect(page).toHaveURL(/\/listing\//);

  const offer = page.locator("aside, main").getByText(/^Līzingā no .+ €\/mēn\.$/).filter({ visible: true }).first();
  await expect(offer).toBeVisible();
  await expect(page.getByText(/pirmā iemaksa \d+% \(.+ €\) · \d+ mēn\./).filter({ visible: true }).first()).toBeVisible();
  // контактное лицо дилера — один раз (раньше дублировалось в карточке цены)
  expect(await page.getByText(/Kontaktpersona/).filter({ visible: true }).count()).toBeLessThanOrEqual(1);
});
