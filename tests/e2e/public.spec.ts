import { expect, test } from "@playwright/test";

import { firstListingPath, press, toggle } from "./helpers";

test("home quick search shows a count and opens /cars with the filter", async ({ page }) => {
  await page.goto("/");
  const submit = page.locator("form button[type=submit]");
  await expect(submit).toContainText(/Rādīt \d+/);

  await page.locator("form button[type=button]").first().click(); // «Marka»
  await page.getByRole("presentation").getByRole("button", { name: /^BMW/ }).click();
  // после марки сразу открывается выбор модели — «любая» модель закрывает панель
  await page.getByRole("presentation").getByRole("button", { name: "Jebkurš modelis", exact: true }).click();
  await expect(submit).toContainText(/Rādīt \d+/);
  await submit.click();
  await expect(page).toHaveURL(/\/cars\?.*brand=bmw/);
});

test("/cars pagination keeps the filters", async ({ page }) => {
  await page.goto("/cars?fuel=diesel");
  const next = page.locator('nav a[href*="page=2"]').first();
  if (await next.count()) {
    await expect(next).toHaveAttribute("href", /fuel=diesel/);
  }
  await page.locator("select").filter({ has: page.locator('option[value="price_asc"]') }).selectOption("price_asc");
  await expect(page).toHaveURL(/fuel=diesel.*sort=price_asc|sort=price_asc.*fuel=diesel/);
  await expect(page).not.toHaveURL(/page=/);
});

test("listing page shows price and the seller", async ({ page }) => {
  await page.goto(await firstListingPath(page));
  await expect(page.locator("h1")).toBeVisible();
  await expect(page.getByText(/\d[\d\s]* €/).filter({ visible: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: /Rādīt tālruni/ }).first()).toBeVisible();
});

test("dealers text search waits for typing to stop", async ({ page }) => {
  await page.goto("/dealers");
  await page.locator("main input").first().pressSequentially("Riga", { delay: 50 });
  await expect(page).not.toHaveURL(/q=/);
  await expect(page).toHaveURL(/q=Riga/);
});

test("compare two cars and toggle only differences", async ({ page }) => {
  await page.goto("/cars");
  const links = page.locator('main a[href*="/listing/"]');
  await expect(links.first()).toBeVisible();
  const hrefs = [...new Set(await links.evaluateAll((els) => els.map((e) => e.getAttribute("href"))))].slice(0, 2);
  expect(hrefs).toHaveLength(2);
  for (const href of hrefs) {
    await page.goto(href!);
    await press(toggle(page, /Salīdzin/));
  }
  await page.goto("/compare");
  await expect(page.getByText("2 no 4")).toBeVisible();
  await expect(page.getByText("Cena", { exact: true }).last()).toBeVisible();
  await page.getByText("Tikai atšķirības").click();
  await expect(page.getByText("Cena", { exact: true }).last()).toBeVisible(); // цены разные — строка остаётся
});

test("pages without dealers carry no dealer data", async ({ page }) => {
  // название дилера берём с /dealers, затем проверяем, что на /about его нет даже в данных страницы
  await page.goto("/dealers");
  const name = (await page.locator("main article h3, main article a").first().innerText()).trim();
  expect(name.length).toBeGreaterThan(2);
  const html = await (await page.request.get("/about")).text();
  expect(html).not.toContain(name);
  expect(html).not.toContain("blockedNote");
});

test("verified badge shows on dealer cards, the dealer page and the listing page", async ({ page }) => {
  await page.goto("/dealers");
  const badge = page.getByRole("img", { name: "Pārbaudīts dīleris" });
  await expect(badge.first()).toBeVisible();

  // карточка с значком → её страница дилера → объявление этого дилера: значок везде
  const card = page.locator("main article").filter({ has: badge }).first();
  await card.locator('a[href*="/dealers/"]').first().click();
  await expect(page).toHaveURL(/\/dealers\/[\w-]+$/);
  await expect(badge.first()).toBeVisible();

  const listing = page.locator('main a[href*="/listing/"]').first();
  if (await listing.count()) {
    await listing.click();
    await expect(page).toHaveURL(/\/listing\//);
    await expect(badge.first()).toBeVisible();
  }
});

// Фильтры /dealers: места и марки — только где есть видимые дилеры, с числом; край находит дилеров своих городов
test("dealers filters: cities, novadi and brands with counts", async ({ page }) => {
  await page.goto("/dealers");
  const city = page.locator('select[aria-label="Pilsēta"]');
  await expect(city.locator('optgroup[label="Pilsētas"] option', { hasText: /^Rīga \(\d+\)$/ })).toHaveCount(1);
  await expect(city.locator('optgroup[label="Novadi"] option', { hasText: /^Ogres novads \(\d+\)$/ })).toHaveCount(1);
  await expect(page.locator('select[aria-label="Marka"] option', { hasText: /^BMW \(\d+\)$/ })).toHaveCount(1);

  await page.goto("/dealers?city=ogres-novads");
  await expect(page.locator("main article").first()).toContainText("Ogre");
  await page.goto("/dealers?brand=bmw");
  await expect(page.locator("main article")).toHaveCount(1);
  await expect(page.locator("main article")).toContainText("Baltic Auto");
});
