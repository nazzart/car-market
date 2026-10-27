import PhoneButton from "@/features/cars/car-list/components/PhoneButton";

// Главная кнопка «Показать телефон» — тот же компонент, что и в списках, в крупном варианте
export default function ContactPhoneButton({ phone, className }: { phone: string; className?: string }) {
  return <PhoneButton phone={phone} variant="primary" className={className} />;
}
