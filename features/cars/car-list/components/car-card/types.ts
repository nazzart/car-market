export type SellerType = "dealer" | "private";

export type CarCardProps = {
  id: string;
  title: string;
  year: number;
  mileage: string;
  engine: string;
  power: string;
  drive: string;
  engineType: string;
  price: string;
  location: string;
  sellerType: SellerType;
  dealerName?: string;
  images: string[];
  totalImages: number;
};