"use client";

import { useRef, useState } from "react";
import Image from "next/image";
import AddPhotoAlternateOutlinedIcon from "@mui/icons-material/AddPhotoAlternateOutlined";
import CloseIcon from "@mui/icons-material/Close";
import LightbulbOutlinedIcon from "@mui/icons-material/LightbulbOutlined";
import { useTranslations } from "next-intl";

import { SectionContainer } from "../components/SectionContainer";
import { FormStepProps } from "../types";

const MAX_PHOTOS = 20;

// Пока фото живут только в браузере (object URL) — загрузку в хранилище добавим вместе с API
export function PhotosSection({ id, title, data, required, updateField }: FormStepProps) {
  const t = useTranslations("sell.photos");
  const inputRef = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  const photos: string[] = data.photos ?? [];

  const addFiles = (files: FileList | null) => {
    if (!files) return;

    const urls = Array.from(files)
      .filter((file) => file.type.startsWith("image/"))
      .map((file) => URL.createObjectURL(file));

    updateField("photos", [...photos, ...urls].slice(0, MAX_PHOTOS));
  };

  const remove = (url: string) => {
    URL.revokeObjectURL(url);
    updateField(
      "photos",
      photos.filter((p) => p !== url)
    );
  };

  const makeCover = (url: string) =>
    updateField("photos", [url, ...photos.filter((p) => p !== url)]);

  return (
    <SectionContainer
      id={id}
      title={title}
      description={t("description")}
      required={required}
      isValid
    >
      {/* Dropzone */}

      <label
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => {
          e.preventDefault();
          setDragging(false);
          addFiles(e.dataTransfer.files);
        }}
        className={`
          flex flex-col items-center justify-center gap-2
          px-6 py-10
          rounded-card
          border-2 border-dashed
          text-center
          cursor-pointer
          transition
          ${dragging ? "border-gray-900 bg-gray-50" : "border-gray-200 hover:border-gray-400 hover:bg-gray-50"}
        `}
      >
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          multiple
          className="sr-only"
          onChange={(e) => {
            addFiles(e.target.files);
            e.target.value = "";
          }}
        />

        <span className="w-14 h-14 flex items-center justify-center rounded-card bg-gray-100 text-gray-700">
          <AddPhotoAlternateOutlinedIcon />
        </span>

        <span className="font-medium text-gray-900">
          {t.rich("drop", {
            choose: (chunks) => <span className="underline underline-offset-4">{chunks}</span>,
          })}
        </span>

        <span className="text-sm text-gray-500">
          {t("formats", { max: MAX_PHOTOS, count: photos.length })}
        </span>
      </label>

      {/* Previews */}

      {photos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4">
          {photos.map((url, i) => (
            <div
              key={url}
              className="group relative aspect-[4/3] rounded-xl overflow-hidden bg-gray-100"
            >
              <Image
                src={url}
                alt={t("alt", { n: i + 1 })}
                fill
                unoptimized
                className="object-cover"
              />

              {i === 0 && (
                <span className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-gray-900/80 text-white text-xs font-medium">
                  {t("cover")}
                </span>
              )}

              <button
                type="button"
                onClick={() => remove(url)}
                aria-label={t("remove")}
                className="absolute top-2 right-2 w-7 h-7 flex items-center justify-center rounded-full bg-white/90 text-gray-900 shadow-sm hover:bg-white transition cursor-pointer"
              >
                <CloseIcon sx={{ fontSize: 16 }} />
              </button>

              {i > 0 && (
                <button
                  type="button"
                  onClick={() => makeCover(url)}
                  className="absolute bottom-2 left-2 px-2 py-0.5 rounded-full bg-white/90 text-gray-900 text-xs font-medium opacity-0 group-hover:opacity-100 focus:opacity-100 transition cursor-pointer"
                >
                  {t("makeCover")}
                </button>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Tips */}

      <div className="flex gap-3 mt-5 p-4 rounded-card bg-warning-soft text-sm text-warning-strong">
        <LightbulbOutlinedIcon fontSize="small" className="text-warning-accent shrink-0" />
        <p>
          {t("tips")}
        </p>
      </div>
    </SectionContainer>
  );
}
