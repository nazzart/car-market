// Скачивает карту (PMTiles) из ежедневной сборки Protomaps — данные OpenStreetMap.
// Сайт отдаёт эти файлы сам, без внешних картографических серверов.
//
//   npm run map:download → public/maps/latvia.pmtiles (~500 МБ, Латвия с контурами домов)
//                          public/maps/region.pmtiles (~75 МБ, соседние страны упрощённо — края карты)
//   MAP_MAXZOOM=14 npm run map:download → Латвия ~270 МБ, без контуров домов
//
// Обновлять несколько раз в год. Нужны curl и unzip (есть на macOS и Linux).
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, renameSync, statSync } from "node:fs";
import { join } from "node:path";

const ROOT = new URL("..", import.meta.url).pathname;
const TOOLS = join(ROOT, ".cache", "pmtiles");
const OUT_DIR = join(ROOT, "public", "maps");

// Границы: запад, юг, восток, север
const FILES = [
  { name: "latvia.pmtiles", bbox: "20.9,55.6,28.3,58.1", maxzoom: process.env.MAP_MAXZOOM ?? "15" },
  { name: "region.pmtiles", bbox: "18.5,53.8,30.5,60.2", maxzoom: "10" },
];

const run = (cmd, args) => execFileSync(cmd, args, { stdio: "inherit" });
const json = async (url) => {
  const res = await fetch(url, { headers: { "User-Agent": "bestauto.lv map download" } });
  if (!res.ok) throw new Error(`${url}: ${res.status}`);
  return res.json();
};

// 1. Инструмент pmtiles (одна программа из релизов Protomaps на GitHub)
async function pmtilesBinary() {
  const bin = join(TOOLS, "pmtiles");
  if (existsSync(bin)) return bin;

  const os = { darwin: "Darwin", linux: "Linux" }[process.platform];
  const arch = { x64: "x86_64", arm64: "arm64" }[process.arch];
  if (!os || !arch) throw new Error(`Нет сборки pmtiles для ${process.platform}/${process.arch}`);

  const release = await json("https://api.github.com/repos/protomaps/go-pmtiles/releases/latest");
  const asset = release.assets.find((a) => a.name.includes(`_${os}_${arch}`));
  if (!asset) throw new Error(`В релизе ${release.tag_name} нет файла для ${os}_${arch}`);

  mkdirSync(TOOLS, { recursive: true });
  const archive = join(TOOLS, asset.name);
  console.log(`Скачиваю pmtiles ${release.tag_name}…`);
  run("curl", ["-sSL", "-o", archive, asset.browser_download_url]);
  run(asset.name.endsWith(".zip") ? "unzip" : "tar", asset.name.endsWith(".zip") ? ["-oq", archive, "-d", TOOLS] : ["-xzf", archive, "-C", TOOLS]);
  return bin;
}

// 2. Последняя ежедневная сборка карты мира → вырезаем только Латвию
const bin = await pmtilesBinary();
const builds = await json("https://build-metadata.protomaps.dev/builds.json");
const latest = builds.at(-1).key;

mkdirSync(OUT_DIR, { recursive: true });
for (const { name, bbox, maxzoom } of FILES) {
  const out = join(OUT_DIR, name);
  const tmp = `${out}.part`;
  console.log(`${name}: вырезаю из сборки ${latest} (zoom до ${maxzoom})…`);
  run(bin, ["extract", `https://build.protomaps.com/${latest}`, tmp, `--bbox=${bbox}`, `--maxzoom=${maxzoom}`]);
  renameSync(tmp, out); // старый файл заменяется, только когда новый скачан полностью
  console.log(`Готово: public/maps/${name}, ${Math.round(statSync(out).size / 1e6)} МБ`);
}
