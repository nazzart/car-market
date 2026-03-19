"use client";

import { SectionContainer } from "../components/SectionContainer";
import { ChipSelect } from "@/components/ui/chip-select/ChipSelect";
import { FormStepProps } from "../types";
import { useSectionNext } from "../hooks/useSectionNext";

const equipmentCategories = {
  comfort: {
    label: "Комфорт",
    options: [
      { value: "climate", label: "Климат-контроль" },
      { value: "dual_climate", label: "2-зонный климат-контроль" },
      { value: "tri_climate", label: "3-зонный климат-контроль" },
      { value: "ac", label: "Кондиционер" },
      { value: "cruise", label: "Круиз-контроль" },
      { value: "adaptive_cruise", label: "Адаптивный круиз-контроль" },
      { value: "heated_seats", label: "Подогрев сидений" },
      { value: "heated_rear_seats", label: "Подогрев задних сидений" },
      { value: "heated_wheel", label: "Подогрев руля" },
      { value: "heated_windshield", label: "Подогрев лобового стекла" },
      { value: "electric_seats", label: "Электропривод сидений" },
      { value: "seat_memory", label: "Память сидений" },
      { value: "ventilated_seats", label: "Вентиляция сидений" },
      { value: "massaging_seats", label: "Массаж сидений" },
      { value: "keyless", label: "Бесключевой доступ" },
      { value: "start_button", label: "Запуск кнопкой" },
      { value: "electric_trunk", label: "Электробагажник" },
      { value: "auto_trunk", label: "Багажник с жестом ноги" },
      { value: "soft_close", label: "Доводчики дверей" },
    ],
  },

  safety: {
    label: "Безопасность",
    options: [
      { value: "abs", label: "ABS" },
      { value: "esp", label: "ESP" },
      { value: "traction_control", label: "Контроль тяги" },
      { value: "blind_spot", label: "Контроль слепых зон" },
      { value: "lane_assist", label: "Контроль полосы" },
      { value: "lane_keep", label: "Удержание в полосе" },
      { value: "auto_brake", label: "Автоматическое торможение" },
      { value: "traffic_sign", label: "Распознавание знаков" },
      { value: "driver_monitor", label: "Контроль усталости водителя" },
      { value: "adaptive_lights", label: "Адаптивный свет" },
      { value: "parking_sensors_front", label: "Передние парктроники" },
      { value: "parking_sensors_rear", label: "Задние парктроники" },
      { value: "rear_camera", label: "Камера заднего вида" },
      { value: "camera_360", label: "Камера 360°" },
      { value: "night_vision", label: "Ночное видение" },
      { value: "auto_parking", label: "Автопарковка" },
    ],
  },

  multimedia: {
    label: "Мультимедиа",
    options: [
      { value: "navigation", label: "Навигация" },
      { value: "bluetooth", label: "Bluetooth" },
      { value: "usb", label: "USB" },
      { value: "apple_carplay", label: "Apple CarPlay" },
      { value: "android_auto", label: "Android Auto" },
      { value: "touchscreen", label: "Сенсорный экран" },
      { value: "digital_cluster", label: "Цифровая приборная панель" },
      { value: "head_up_display", label: "Head-Up Display" },
      { value: "wireless_charging", label: "Беспроводная зарядка" },
      { value: "premium_audio", label: "Премиум аудиосистема" },
      { value: "subwoofer", label: "Сабвуфер" },
      { value: "rear_screens", label: "Экраны для задних пассажиров" },
      { value: "tv", label: "TV-тюнер" },
      { value: "voice_control", label: "Голосовое управление" },
      { value: "internet", label: "Интернет в автомобиле" },
    ],
  },

  interior: {
    label: "Салон",
    options: [
      { value: "leather", label: "Кожаный салон" },
      { value: "alcantara", label: "Алькантара" },
      { value: "sport_seats", label: "Спортивные сиденья" },
      { value: "ambient_light", label: "Амбиентная подсветка" },
      { value: "wood_trim", label: "Деревянные вставки" },
      { value: "aluminum_trim", label: "Алюминиевые вставки" },
      { value: "folding_rear_seats", label: "Складные задние сиденья" },
      { value: "armrest", label: "Подлокотник" },
      { value: "heated_rear_window", label: "Обогрев заднего стекла" },
    ],
  },

  exterior: {
    label: "Экстерьер",
    options: [
      { value: "led", label: "LED фары" },
      { value: "matrix_led", label: "Matrix LED фары" },
      { value: "xenon", label: "Ксеноновые фары" },
      { value: "laser_lights", label: "Лазерные фары" },
      { value: "fog_lights", label: "Противотуманные фары" },
      { value: "panorama", label: "Панорамная крыша" },
      { value: "sunroof", label: "Люк" },
      { value: "tinted_windows", label: "Тонированные стекла" },
      { value: "roof_rails", label: "Рейлинги на крыше" },
      { value: "towbar", label: "Фаркоп" },
      { value: "electric_mirrors", label: "Электрозеркала" },
      { value: "heated_mirrors", label: "Подогрев зеркал" },
      { value: "auto_dimming_mirrors", label: "Автозатемнение зеркал" },
    ],
  },

  wheels: {
    label: "Колеса",
    options: [
      { value: "alloy_wheels", label: "Литые диски" },
      { value: "sport_wheels", label: "Спортивные диски" },
      { value: "summer_tires", label: "Летняя резина" },
      { value: "winter_tires", label: "Зимняя резина" },
      { value: "all_season_tires", label: "Всесезонная резина" },
      { value: "tire_pressure", label: "Датчики давления шин" },
      { value: "runflat", label: "RunFlat шины" },
      { value: "spare_wheel", label: "Запасное колесо" },
    ],
  },
};

export function CarEquipmentSection({
  id,
  title,
  data,
  required,
  onNext,
  updateField,
}: FormStepProps) {

  const isValid = !required;

  const { handleNext } = useSectionNext(isValid, required, onNext);

  return (
    <SectionContainer
      id={id}
      title={title}
      required={required}
      isValid={isValid}
      onNext={handleNext}
    >
      <div className="flex flex-col gap-6">
        {Object.entries(equipmentCategories).map(([key, category]) => (
          <ChipSelect
            key={key}
            label={category.label}
            options={category.options}
            value={data[key]}
            onChange={(value) => updateField(key, value)}
            multiple
          />
        ))}
      </div>
    </SectionContainer>
  );
}
