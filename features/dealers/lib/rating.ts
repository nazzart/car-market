import type { Dealer } from "../types";

// Рейтинг показываем только при достаточном числе отзывов:
// «5.0» по одному отзыву вводит покупателей в заблуждение
const MIN_REVIEWS_FOR_RATING = 5;

export const hasRating = (dealer: Dealer) =>
  dealer.rating !== undefined && (dealer.reviews ?? 0) >= MIN_REVIEWS_FOR_RATING;
