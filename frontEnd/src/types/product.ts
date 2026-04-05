export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  originalPrice?: number;
  image: string;
  category: string;
  rating: number;
  numReviews: number;
  stock: number;
  isFeatured?: boolean;
  isNew?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  image: string;
}

export interface CartItem extends Product {
  quantity: number;
}