import { loadEnvConfig } from "@next/env";
import { expect, test } from "@playwright/test";
import pg from "pg";

import { firstListingPath } from "./helpers";

loadEnvConfig(process.cwd());

// Просмотры и открытия телефона: посетитель считается раз в сутки — повторное не добавляет; другой браузер — новый посетитель.
// Счётчик читается прямо из базы (страница объявления кэшируется до 5 минут), после теста возвращается как был
test("listing views and phone views count each visitor once a day", async ({ page, browser }) => {
  const db = new pg.Client({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL });
  await db.connect();
  const path = await firstListingPath(page);
  const id = Number(path.split("/").at(-1));
  const counts = async () =>
    (await db.query<{ views: number; phone_views: number }>("select views, phone_views from listings where id = $1", [id])).rows[0];
  const views = async () => (await counts()).views;
  const phoneViews = async () => (await counts()).phone_views;
  const { views: before, phone_views: phoneBefore } = await counts();
  const start = new Date();

  // обычные браузеры: «HeadlessChrome» по умолчанию считается роботом и не засчитывается
  const visitor = await browser.newPage({ userAgent: "Mozilla/5.0 (Macintosh) QA-e2e-browser" });
  try {
    await visitor.goto(path);
    await expect.poll(views).toBe(before + 1);

    // «Показать телефон» — отдельный счётчик, тоже раз в сутки на посетителя
    const showPhone = () => visitor.locator("aside").getByRole("button", { name: "Rādīt tālruni" }).click();
    await showPhone();
    await expect.poll(phoneViews).toBe(phoneBefore + 1);

    await visitor.reload();
    await visitor.waitForLoadState("networkidle");
    expect(await views()).toBe(before + 1);
    await showPhone();
    await visitor.waitForLoadState("networkidle");
    expect(await phoneViews()).toBe(phoneBefore + 1);

    const other = await browser.newPage({ userAgent: "Mozilla/5.0 (Macintosh) QA-e2e-other-browser" });
    await other.goto(path);
    await expect.poll(views).toBe(before + 2);
    await other.close();

    // робот (по умолчанию Playwright — HeadlessChrome) не считается
    await page.goto(path);
    await page.waitForLoadState("networkidle");
    expect(await views()).toBe(before + 2);
  } finally {
    await visitor.close();
    await db.query("update listings set views = $2, phone_views = $3 where id = $1", [id, before, phoneBefore]);
    await db.query("delete from listing_views where listing_id = $1 and created_at >= $2", [id, start]);
    await db.end();
  }
});
