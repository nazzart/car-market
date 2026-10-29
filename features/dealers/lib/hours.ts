import { DAYS, Day, OpeningHours } from "../types";

const trimHour = (time: string) => time.replace(/^0(\d)/, "$1");

// Соседние дни с одинаковым временем объединяются: «P–Pk 9:00–19:00, S 10:00–16:00».
// dayLabel — перевод options.days.{day}
export const formatHours = (hours: OpeningHours, dayLabel: (day: string) => string) => {
  const groups: { from: Day; to: Day; time: string }[] = [];

  for (const day of DAYS) {
    const h = hours[day];
    if (!h) continue;

    const time = `${trimHour(h.open)}–${trimHour(h.close)}`;
    const last = groups.at(-1);
    const prevDay = DAYS[DAYS.indexOf(day) - 1];

    if (last && last.time === time && last.to === prevDay) last.to = day;
    else groups.push({ from: day, to: day, time });
  }

  return groups
    .map((g) =>
      g.from === g.to
        ? `${dayLabel(g.from)} ${g.time}`
        : `${dayLabel(g.from)}–${dayLabel(g.to)} ${g.time}`
    )
    .join(", ");
};
