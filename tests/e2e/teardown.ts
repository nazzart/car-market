import { loadEnvConfig } from "@next/env";
import { DeleteObjectsCommand, ListObjectsV2Command, S3Client } from "@aws-sdk/client-s3";
import pg from "pg";

// После тестов — удалить созданные ими аккаунты (и страницы дилеров) из базы и их фото из R2
export default async function teardown() {
  loadEnvConfig(process.cwd());
  const client = new pg.Client({ connectionString: process.env.MIGRATIONS_DATABASE_URL ?? process.env.DATABASE_URL });
  await client.connect();
  try {
    const { rows } = await client.query<{ id: string }>("select id from auth.users where email like 'qa.e2e-%@bestauto-qa.lv'");
    await deletePhotos(rows.map((r) => r.id));
    await client.query(
      "delete from dealers where id in (select p.dealer_id from profiles p join auth.users u on u.id = p.id where u.email like 'qa.e2e-%@bestauto-qa.lv')"
    );
    await client.query("delete from auth.users where email like 'qa.e2e-%@bestauto-qa.lv'");
  } finally {
    await client.end();
  }
}

// Фото тестовых аккаунтов: папки listings/{userId}/ (lib/storage.ts). Без ключей R2 — нечего удалять
async function deletePhotos(userIds: string[]) {
  const e = process.env;
  if (!e.R2_ACCOUNT_ID || !e.R2_ACCESS_KEY_ID || !e.R2_SECRET_ACCESS_KEY || !e.R2_BUCKET) return;
  const s3 = new S3Client({
    region: "auto",
    endpoint: `https://${e.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId: e.R2_ACCESS_KEY_ID, secretAccessKey: e.R2_SECRET_ACCESS_KEY },
  });
  for (const id of userIds) {
    const listed = await s3.send(new ListObjectsV2Command({ Bucket: e.R2_BUCKET, Prefix: `listings/${id}/` }));
    const keys = (listed.Contents ?? []).map((o) => ({ Key: o.Key! }));
    if (keys.length) await s3.send(new DeleteObjectsCommand({ Bucket: e.R2_BUCKET, Delete: { Objects: keys } }));
  }
}
