import { loadEnvConfig } from "@next/env";
import { expect, test } from "@playwright/test";
import pg from "pg";

import { firstListingPath } from "./helpers";

loadEnvConfig(process.cwd());

// Просмотры: посетитель считается раз в сутки — повторное открытие не добавляет; другой браузер — новый посетитель.
// Счётчик читается прямо из базы (страница объявления кэшируется до 5 минут), после теста возвращается как был
test("listing views count each visitor once a day", async ({ page, browser }) => {
  const db = new pg.Client({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL });
  await db.connect();
  const path = await firstListingPath(page);
  const id = Number(path.split("/").at(-1));
  const views = async () => (await db.query<{ views: number }>("select views from listings where id = $1", [id])).rows[0].views;
  const before = await views();
  const start = new Date();

  // обычные браузеры: «HeadlessChrome» по умолчанию считается роботом и не засчитывается
  const visitor = await browser.newPage({ userAgent: "Mozilla/5.0 (Macintosh) QA-e2e-browser" });
  try {
    await visitor.goto(path);
    await expect.poll(views).toBe(before + 1);

    await visitor.reload();
    await visitor.waitForLoadState("networkidle");
    expect(await views()).toBe(before + 1);

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
    await db.query("update listings set views = $2 where id = $1", [id, before]);
    await db.query("delete from listing_views where listing_id = $1 and created_at >= $2", [id, start]);
    await db.end();
  }
});
