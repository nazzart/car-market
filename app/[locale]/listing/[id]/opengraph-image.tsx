import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";

import { getListing } from "@/features/cars/api";

// Картинка-превью для ссылки на объявление (WhatsApp, Telegram, Facebook…)
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "bestauto.lv";

const CARMINE = "#A4343A";
// Шрифт по умолчанию — только базовая латиница: города и т. п. с ā/ē не выводим.
// TODO: подключить шрифт с латышскими буквами, когда будет свой статический хостинг шрифтов
const group = (n: number) => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, " ");

type ImageProps = { params: Promise<{ id: string }> };

export default async function Image({ params }: ImageProps) {
  const { id } = await params;
  const listing = await getListing(id);

  const photo = listing?.images[0]
    ? `data:image/jpeg;base64,${(await readFile(join(process.cwd(), "public", listing.images[0]))).toString("base64")}`
    : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#111827" }}>
        {photo && (
          <img src={photo} alt="" width={1200} height={630} style={{ position: "absolute", inset: 0, objectFit: "cover" }} />
        )}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            background: "linear-gradient(180deg, rgba(0,0,0,0.15) 0%, rgba(0,0,0,0) 35%, rgba(0,0,0,0.85) 100%)",
          }}
        />

        <div style={{ position: "absolute", top: 40, left: 48, display: "flex", padding: "10px 22px", borderRadius: 999, background: "white", color: CARMINE, fontSize: 30, fontWeight: 700 }}>
          bestauto.lv
        </div>

        {listing && (
          <div style={{ position: "absolute", left: 48, right: 48, bottom: 44, display: "flex", alignItems: "flex-end", justifyContent: "space-between", color: "white" }}>
            <div style={{ display: "flex", flexDirection: "column", maxWidth: 760 }}>
              <div style={{ fontSize: 60, fontWeight: 700, lineHeight: 1.1 }}>{listing.title}</div>
              <div style={{ fontSize: 32, opacity: 0.85, marginTop: 12 }}>
                {`${listing.year} · ${group(listing.mileage)} km · ${listing.power} hp`}
              </div>
            </div>
            <div style={{ display: "flex", padding: "14px 28px", borderRadius: 24, background: CARMINE, fontSize: 52, fontWeight: 700 }}>
              {`${group(listing.price)} €`}
            </div>
          </div>
        )}
      </div>
    ),
    size
  );
}
