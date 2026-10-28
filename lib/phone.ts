// Единое правило для телефонов на всём сайте (форма продажи, настройки, контактные лица):
// «+371 2000 3001», «+37120003001», «2000-3001» — допустимы пробелы и дефисы, 7–15 цифр
export const isPhone = (value: string) => {
  const trimmed = value.trim();
  if (!/^\+?[\d\s-]+$/.test(trimmed)) return false;
  const digits = trimmed.replace(/\D/g, "").length;
  return digits >= 7 && digits <= 15;
};

// Для ссылки tel: — только «+» и цифры
export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, "")}`;
