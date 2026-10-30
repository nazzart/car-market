import { expect, test } from "@playwright/test";

// Версия в форме подачи: модель — только модели, версия — одно поле; «530d» в поле модели заполняет обе,
// своё написание приводится к единому виду, лишние знаки убираются, заголовок собирается сам
test("sell form: model and version, normalised version and the title", async ({ page }) => {
  await page.goto("/sell?category=car");
  const preview = page.getByText("Sludinājuma virsraksts").locator("..");
  const modelField = page.getByRole("combobox", { name: "Modelis" });
  const versionField = page.getByRole("combobox", { name: "Versija" });

  await page.getByRole("combobox", { name: "Marka" }).fill("BMW");
  await page.getByRole("option", { name: "BMW", exact: true }).click();

  // в списке моделей нет версий: «5 Series» — одна строка
  await modelField.click();
  await expect(page.getByRole("option", { name: "5 Series", exact: true })).toBeVisible();
  await expect(page.getByRole("option", { name: /^530/ })).toHaveCount(0);

  // версия вписана в поле модели — модель и версия заполняются сразу
  await modelField.fill("530d");
  await page.getByRole("option", { name: /^5 Series · 530d$/ }).click();
  await expect(modelField).toHaveValue("5 Series");
  await expect(versionField).toHaveValue("530d");
  await expect(preview).toContainText("BMW 530d");

  // своё написание — к виду из каталога; знаки вроде «!» убираются
  await versionField.fill("530D XDRIVE!!!");
  await versionField.blur();
  await expect(versionField).toHaveValue("530d xDrive");
  await expect(preview).toContainText("BMW 530d xDrive");

  // лизинг — только у дилеров: гостю блока нет
  await expect(page.getByText(/^Līzings ·/)).toHaveCount(0);

  // необязательный выбор можно снять: «Nav norādīts»
  const negotiable = page.getByRole("combobox", { name: "Vai cena ir runājama?" });
  await negotiable.click();
  await page.getByRole("option", { name: "Jā, runājama" }).click();
  await expect(negotiable).toHaveText("Jā, runājama");
  await negotiable.click();
  await page.getByRole("option", { name: "Nav norādīts" }).click();
  await expect(negotiable).not.toHaveText("Jā, runājama");

  // другая марка — модель и версия сбрасываются; у Mercedes модель в заголовке не повторяется
  await page.getByRole("combobox", { name: "Marka" }).fill("Mercedes");
  await page.getByRole("option", { name: "Mercedes-Benz", exact: true }).click();
  await expect(versionField).toHaveValue("");
  await modelField.fill("CL 500");
  await page.getByRole("option", { name: /^CL · CL 500$/ }).click();
  await expect(preview).toContainText("Mercedes-Benz CL 500");
});

// Список моделей: под моделью — её версии из объявлений; выбор версии — сразу модель и версия
test("cars filter: a version picked under its model in the model list", async ({ page }) => {
  await page.goto("/cars?brand=bmw");
  const model = page.locator("aside").getByRole("combobox", { name: "Modelis" });
  await model.click();
  // «120» с отступом под «1 Series»
  await page.getByRole("option").filter({ has: page.getByText("120", { exact: true }) }).click();

  await expect(page).toHaveURL(/version=120/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("BMW 120");
  await expect(model).toHaveValue("1 Series · 120");
  for (const title of await page.locator("main article h3").allTextContents()) expect(title).toMatch(/BMW 120/);
});

// «BMW 530» — ввести в поле модели
test("cars filter: typing 530 in the model list filters BMW 530 directly", async ({ page }) => {
  await page.goto("/cars?brand=bmw");
  const option = page.getByRole("option", { name: /^5 Series · 530/ });
  // ввод до гидратации React сбрасывает — повторяем, пока не появится вариант
  await expect(async () => {
    await page.locator("aside").getByRole("combobox", { name: "Modelis" }).fill("530");
    await expect(option).toBeVisible({ timeout: 2000 });
  }).toPass();
  await option.click();

  await expect(page).toHaveURL(/version=530/);
  await expect(page.getByRole("heading", { level: 1 })).toHaveText("BMW 530");
  for (const title of await page.locator("main article h3").allTextContents()) expect(title).toMatch(/BMW 530/);
});
