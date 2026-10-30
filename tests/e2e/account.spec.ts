import { expect, test } from "@playwright/test";

import { PASSWORD, firstListingPath, press, qaEmail, qaRegNumber, register, toggle } from "./helpers";

test("private account: settings, favorites with undo, delete account", async ({ page }) => {
  const email = qaEmail("private");
  await register(page, "private", { name: "Qa Privats", email });
  await expect(page.getByRole("banner")).not.toContainText("Ienākt");

  // настройки: без телефона не сохраняется, с телефоном — сохраняется и остаётся после перезагрузки
  await page.goto("/account/profile");
  await page.getByLabel("Uzvārds").fill("Testers");
  await page.getByRole("button", { name: "Saglabāt", exact: true }).click();
  await expect(page.locator(".MuiSnackbar-root")).toContainText("Izlabojiet kļūdas");
  await page.locator('input[type="tel"]').fill("+371 2000 4321");
  await page.getByRole("button", { name: "Saglabāt", exact: true }).click();
  await expect(page.locator(".MuiSnackbar-root")).toContainText("Izmaiņas saglabātas");
  await page.reload();
  await expect(page.getByLabel("Uzvārds")).toHaveValue("Testers");

  // избранное: добавить, удалить, отменить
  await page.goto(await firstListingPath(page));
  await press(toggle(page, /Saglabāt/));
  // сохранение уходит на сервер (Server Action) — дождаться, иначе переход оборвёт запрос
  await page.waitForLoadState("networkidle");
  await page.goto("/favorites");
  await expect(page.locator("main article")).toHaveCount(1);
  await page.getByRole("button", { name: "Izņemt no izlases" }).click();
  await expect(page.getByText("Izlase pagaidām ir tukša")).toBeVisible();
  await page.getByRole("button", { name: "Atsaukt" }).click();
  await expect(page.locator("main article")).toHaveCount(1);

  // удаление аккаунта: неверный пароль — ошибка, верный — выход на главную
  await page.goto("/account/profile");
  await page.getByRole("button", { name: "Dzēst kontu" }).click();
  const dialog = page.getByRole("dialog");
  await dialog.locator('input[type="password"]').fill("wrong-password");
  await dialog.locator('input[type="password"]').press("Enter");
  await expect(dialog).toContainText("Nepareiza parole");
  await dialog.locator('input[type="password"]').fill(PASSWORD);
  await dialog.locator('input[type="password"]').press("Enter");
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("banner")).toContainText("Ienākt");
});

test("company account: incomplete profile notice and registration number in settings", async ({ page }) => {
  const regNumber = qaRegNumber();
  await register(page, "company", { name: "QA E2E Salons", email: qaEmail("company"), regNumber });

  await page.goto("/account");
  await expect(page.getByText("Pabeidziet uzņēmuma profilu")).toBeVisible();
  // вкладки подписаны переводом, а не ключом
  await expect(page.getByText(/^Aktīvie/).first()).toBeVisible();
  await expect(page.locator("main")).not.toContainText("account.");

  await page.goto("/account/profile");
  await expect(page.getByLabel(/Reģistrācijas numurs/)).toHaveValue(regNumber);
  // без адреса страница дилера не сохраняется
  await page.locator('input[type="tel"]').fill("+371 2000 9999");
  await page.getByRole("button", { name: "Saglabāt", exact: true }).click();
  await expect(page.getByText("Norādiet adresi")).toBeVisible();
});

// Одна компания — одна страница: второй аккаунт с тем же регистрационным номером не создаётся
test("company registration with a taken registration number shows a clear error", async ({ page, browser }) => {
  const regNumber = qaRegNumber();
  await register(page, "company", { name: "QA E2E Pirmais", email: qaEmail("first"), regNumber });

  const other = await (await browser.newContext()).newPage();
  await expect(register(other, "company", { name: "QA E2E Otrais", email: qaEmail("second"), regNumber })).rejects.toThrow();
  await expect(other.getByRole("dialog").getByText(/jau ir reģistrēts/)).toBeVisible();
  await other.context().close();
});

// Дилер решает, показывать ли контактное лицо в объявлениях: переключатель сохраняется вместе со страницей дилера
test("company settings: hide the contact person on listings", async ({ page }) => {
  await register(page, "company", { name: "QA E2E Kontakti", email: qaEmail("contacts"), regNumber: qaRegNumber() });
  await page.goto("/account/profile");

  const toggle = page.getByRole("switch", { name: /Rādīt kontaktpersonu sludinājumos/ });
  await expect(toggle).toHaveCount(0); // без контактных лиц переключателя нет

  await page.locator('input[type="tel"]').first().fill("+371 2000 9999");
  await page.getByLabel(/Adrese un pilsēta/).fill("Brīvības iela 100, Rīga");
  await page.keyboard.press("Escape");

  await page.getByRole("button", { name: "Pievienot kontaktpersonu" }).click();
  await page.getByLabel("Vārds, uzvārds").fill("Qa Konsultants");
  await page.getByRole("textbox", { name: "Tālrunis", exact: true }).last().fill("+371 2000 8888");
  await page.getByRole("button", { name: "Pievienot", exact: true }).click();

  await expect(toggle).toBeChecked(); // по умолчанию — показывать
  await toggle.click();
  await page.getByRole("button", { name: "Saglabāt", exact: true }).click();
  await expect(page.locator(".MuiSnackbar-root")).toContainText("Izmaiņas saglabātas");

  await page.reload();
  await expect(toggle).not.toBeChecked();
});
