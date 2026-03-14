"use client";

import { Button } from "@mui/material";

import { SectionContainer } from "../components/SectionContainer";

type Props = {
  onSubmit?: () => void;
};

export function PublishSection({ onSubmit }: Props) {
  return (
    <SectionContainer
      id="publish"
      title="Публикация объявления"
      description="Проверьте информацию и опубликуйте объявление"
    >
      <div className="flex flex-col gap-6">
        {/* publish button */}

        <Button
          variant="contained"
          color="success"
          size="large"
          onClick={onSubmit}
          sx={{ height: 52 }}
        >
          Опубликовать объявление
        </Button>
      </div>
    </SectionContainer>
  );
}
