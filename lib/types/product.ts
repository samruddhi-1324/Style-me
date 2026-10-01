export type ProductCategory = 'Eyeglasses' | 'Sunglasses' | 'Blue-light' | 'Kids';
export type FrameSize = 'Small' | 'Medium' | 'Large';
export type FrameGender = 'Men' | 'Women' | 'Unisex' | 'Kids';
export type FrameFit = 'Snug' | 'Good' | 'Loose';

export interface FrameMeasurements {
  frameWidth: number;
  lensHeight: number;
  bridgeWidth: number;
  templeLength: number;
}

export interface Product {
  id: string;
  name: string;
  category: ProductCategory;
  color: string;
  colors: string[];
  price: number;
  originalPrice: number;
  rating: number;
  reviewCount: number;
  size: FrameSize;
  material: string;
  frameShape: string;
  frameColor?: string;
  faceShapes?: string[];
  gender: FrameGender;
  weight: string;
  prescriptionRange: string;
  warranty: string;
  measurements: FrameMeasurements;
  fit: FrameFit;
  fitNote: string;
  badges: string[];
  images: string[];
  description: string;
  inStock: boolean;
  isNew: boolean;
  isFeatured: boolean;
  isAiPick?: boolean;
}

export interface ProductFilterOptions {
  category?: ProductCategory | 'All';
  gender?: FrameGender | 'All';
  frameShape?: string;
  material?: string;
  size?: FrameSize;
  minPrice?: number;
  maxPrice?: number;
  sortBy?: 'featured' | 'price-low' | 'price-high' | 'rating' | 'newest';
  searchQuery?: string;
}

export interface ProductListResponse {
  products: Product[];
  totalCount: number;
  page: number;
  pageSize: number;
  totalPages: number;
}
