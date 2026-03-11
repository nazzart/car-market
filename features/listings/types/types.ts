export type Listing = {
    id: string
    title: string
    year: number
    price: number
    km: number
    fuel: string
    transmission: string
    location: string
    status: "active" | "sold" | "draft"
    views: number
    image: string
  }