import PhoneButton from "@/features/cars/car-list/components/PhoneButton";

type ContactPhoneButtonProps = { phone: string; className?: string };

// Главная кнопка «Показать телефон» — тот же компонент, что и в списках, в крупном варианте
export default function ContactPhoneButton({ phone, className }: ContactPhoneButtonProps) {
  return <PhoneButton phone={phone} variant="primary" className={className} />;
}
