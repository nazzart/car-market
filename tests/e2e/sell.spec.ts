import { readFileSync } from "node:fs";

import { loadEnvConfig } from "@next/env";
import { expect, test } from "@playwright/test";

import { qaEmail, register } from "./helpers";

// R2_* — из .env.local: с ключами тест загружает и фото
loadEnvConfig(process.cwd());

// Тестовое фото — настоящий снимок из public/cars (заодно проверяется уменьшение в браузере)
const testPhoto = () => readFileSync("public/cars/bmw.jpg");

// Подача объявления целиком: частное лицо заполняет обязательные разделы и публикует (с фото, если заданы ключи R2) —
// объявление сохраняется в базе, открывается его страница с плашкой «на проверке»
test("sell form: a private seller publishes a listing and it waits for review", async ({ page }) => {
  await register(page, "private", { name: "Qa Pārdevējs", email: qaEmail("seller") });
  await page.goto("/sell?category=car");
  const next = () => page.getByRole("button", { name: "Tālāk", exact: true }).last().click();

  // Pamatinformācija
  await page.getByRole("combobox", { name: "Marka" }).fill("BMW");
  await page.getByRole("option", { name: "BMW", exact: true }).click();
  await page.getByRole("combobox", { name: "Modelis" }).fill("530d");
  await page.getByRole("option", { name: /^5 Series · 530d$/ }).click();
  await page.getByLabel("Izlaiduma gads").fill("2018");
  await page.getByLabel("Nobraukums").first().fill("150000");
  await page.getByLabel("Cena").first().fill("21500");
  await page.getByRole("button", { name: "Sedans" }).click();
  await page.getByRole("button", { name: "Melna" }).click();
  await next();

  // Tehniskie dati: degviela jau izvēlēta pēc versijas (530d → dīzelis)
  await page.getByLabel("Dzinēja tilpums").fill("3.0");
  await page.getByLabel("Jauda").fill("265");
  await page.getByRole("button", { name: "Automāts" }).click();
  await page.getByRole("button", { name: "Pilnpiedziņa" }).click();
  await next();

  // Vēsture: tehniskā apskate
  await page.getByRole("combobox", { name: "Tehniskā apskate līdz" }).click();
  await page.getByRole("option").nth(3).click();
  await next();

  // stāvoklis un komplektācija — nav obligāti
  await page.getByRole("button", { name: "Izlaist" }).last().click();
  await page.getByRole("button", { name: "Izlaist" }).last().click();

  // Apraksts
  await page.getByLabel("Apraksts").fill("Labā stāvoklī, apkope veikta laikā. QA e2e tests.");
  await next();

  // Kontakti: jaunam kontam tālrunis un vieta vēl nav norādīti
  await page.getByRole("textbox", { name: "Tālrunis" }).fill("+371 2000 7777");
  await page.getByRole("combobox", { name: /Kur atrodas/ }).fill("Rīga");
  await page.getByRole("option", { name: "Rīga", exact: true }).click();
  await next();

  // Foto: fails tiek samazināts pārlūkā un augšupielādēts R2 (bez R2 atslēgām — publicē bez foto)
  if (process.env.R2_PUBLIC_URL) {
    await page.locator('input[type="file"]').setInputFiles({ name: "car.jpg", mimeType: "image/jpeg", buffer: testPhoto() });
    await expect(page.getByText("pievienoti 1")).toBeVisible();
  }

  await page.getByRole("button", { name: "Publicēt sludinājumu" }).click();

  await expect(page).toHaveURL(/\/listing\/\d+$/, { timeout: 20_000 });
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("BMW 530d, 2018");
  await expect(page.getByText(/pārbaud/i).first()).toBeVisible();
  await expect(page.getByText(/^21\s500 €$/).filter({ visible: true }).first()).toBeVisible();
  if (process.env.R2_PUBLIC_URL) {
    // фото — из R2 (через next/image): адрес публичного бакета в src
    const photo = page.locator("main img").first();
    await expect(photo).toHaveAttribute("src", new RegExp(encodeURIComponent(new URL(process.env.R2_PUBLIC_URL).host)));
    await expect.poll(() => photo.evaluate((img: HTMLImageElement) => img.complete && img.naturalWidth)).toBeGreaterThan(0);
  }
  const id = page.url().split("/").at(-1);

  // в кабинете продавца — «ждёт одобрения»; в поиске до одобрения модератором — нет
  await page.goto("/account");
  await expect(page.getByText("1 sludinājums gaida apstiprinājumu")).toBeVisible();
  await page.goto("/cars?brand=bmw");
  await expect(page.locator(`main a[href$="/listing/${id}"]`)).toHaveCount(0);
});
