import { products as rawProducts } from '@/data/products';
import { apiRequest } from '@/lib/api/apiClient';
import { Product, ProductFilterOptions, ProductListResponse } from '@/lib/types/product';

type BackendProduct = {
  id?: string;
  sku?: string;
  name?: string;
  category?: string;
  color?: string;
  colors?: string[];
  price?: number | string;
  originalPrice?: number | string;
  rating?: number | string;
  reviewCount?: number;
  size?: string;
  material?: string;
  frameShape?: string;
  frameColor?: string;
  faceShapes?: string[];
  gender?: string;
  weight?: string;
  prescriptionRange?: string;
  warranty?: string;
  measurements?: {
    frameWidth?: number;
    lensHeight?: number;
    bridgeWidth?: number;
    templeLength?: number;
  };
  fit?: string;
  fitNote?: string;
  badges?: string[];
  images?: string[];
  description?: string;
  inStock?: boolean;
  isNew?: boolean;
  isFeatured?: boolean;
  isAiPick?: boolean;
};

const parseNumber = (value: number | string | undefined, fallback: number): number => {
  const parsed = Number(value ?? fallback);
  return Number.isFinite(parsed) ? parsed : fallback;
};

const mapBackendProduct = (product: BackendProduct): Product => {
  const measurements = product.measurements ?? {
    frameWidth: 138,
    lensHeight: 48,
    bridgeWidth: 18,
    templeLength: 145,
  };

  return {
    id: product.id ?? '',
    name: product.name ?? 'StyleMe Frame',
    category: (product.category ?? 'Eyeglasses') as Product['category'],
    color: product.color ?? product.frameColor ?? 'Black',
    colors: product.colors?.length ? product.colors : [product.color ?? product.frameColor ?? 'Black'],
    price: parseNumber(product.price, 0),
    originalPrice: parseNumber(product.originalPrice, parseNumber(product.price, 0)),
    rating: parseNumber(product.rating, 0),
    reviewCount: product.reviewCount ?? 0,
    size: (product.size ?? 'Medium') as Product['size'],
    material: product.material ?? 'Acetate',
    frameShape: product.frameShape ?? 'Rectangle',
    frameColor: product.frameColor ?? product.color ?? 'Black',
    faceShapes: product.faceShapes ?? [],
    gender: (product.gender ?? 'Unisex') as Product['gender'],
    weight: product.weight ?? '18g',
    prescriptionRange: product.prescriptionRange ?? 'All',
    warranty: product.warranty ?? '12 months',
    measurements: {
      frameWidth: Number(measurements.frameWidth ?? 138),
      lensHeight: Number(measurements.lensHeight ?? 48),
      bridgeWidth: Number(measurements.bridgeWidth ?? 18),
      templeLength: Number(measurements.templeLength ?? 145),
    },
    fit: (product.fit ?? 'Good') as Product['fit'],
    fitNote: product.fitNote ?? 'Designed for everyday comfort.',
    badges: product.badges ?? [],
    images: product.images ?? [],
    description: product.description ?? 'Premium eyewear from StyleMe.',
    inStock: product.inStock ?? true,
    isNew: product.isNew ?? false,
    isFeatured: product.isFeatured ?? false,
    isAiPick: product.isAiPick ?? false,
  };
};

const getFallbackProducts = async (options: ProductFilterOptions = {}): Promise<ProductListResponse> => {
  let result = [...(rawProducts as Product[])];

  if (options.category && options.category !== 'All') {
    result = result.filter((p) => p.category === options.category);
  }

  if (options.gender && options.gender !== 'All') {
    result = result.filter((p) => p.gender === options.gender || p.gender === 'Unisex');
  }

  if (options.frameShape) {
    result = result.filter((p) => p.frameShape.toLowerCase() === options.frameShape?.toLowerCase());
  }

  if (options.material) {
    result = result.filter((p) => p.material.toLowerCase() === options.material?.toLowerCase());
  }

  if (options.size) {
    result = result.filter((p) => p.size === options.size);
  }

  if (options.minPrice !== undefined) {
    result = result.filter((p) => p.price >= options.minPrice!);
  }

  if (options.maxPrice !== undefined) {
    result = result.filter((p) => p.price <= options.maxPrice!);
  }

  if (options.searchQuery) {
    const q = options.searchQuery.toLowerCase();
    result = result.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.color.toLowerCase().includes(q) ||
        p.frameShape.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q)
    );
  }

  if (options.sortBy) {
    switch (options.sortBy) {
      case 'price-low':
        result.sort((a, b) => a.price - b.price);
        break;
      case 'price-high':
        result.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        result.sort((a, b) => b.rating - a.rating);
        break;
      case 'newest':
        result.sort((a, b) => Number(b.isNew) - Number(a.isNew));
        break;
      case 'featured':
      default:
        result.sort((a, b) => Number(b.isFeatured) - Number(a.isFeatured));
        break;
    }
  }

  return {
    products: result,
    totalCount: result.length,
    page: 1,
    pageSize: result.length,
    totalPages: 1,
  };
};

export class ProductService {
  static async getProducts(options: ProductFilterOptions = {}): Promise<ProductListResponse> {
    const request = async (): Promise<ProductListResponse> => {
      const params = new URLSearchParams();
      if (options.category && options.category !== 'All') params.set('category', options.category);
      if (options.gender && options.gender !== 'All') params.set('gender', options.gender);
      if (options.frameShape) params.set('frameShape', options.frameShape);
      if (options.material) params.set('material', options.material);
      if (options.size) params.set('size', options.size);
      if (options.minPrice !== undefined) params.set('minPrice', String(options.minPrice));
      if (options.maxPrice !== undefined) params.set('maxPrice', String(options.maxPrice));
      if (options.sortBy) params.set('sortBy', options.sortBy);
      if (options.searchQuery) params.set('searchQuery', options.searchQuery);
      params.set('page', '1');
      params.set('pageSize', '12');

      const response = await apiRequest<{
        items?: BackendProduct[];
        products?: BackendProduct[];
        totalCount?: number;
        page?: number;
        pageSize?: number;
        totalPages?: number;
      }>(`/api/v1/products?${params.toString()}`);

      const items = response.items ?? response.products ?? [];

      return {
        products: items.map(mapBackendProduct),
        totalCount: response.totalCount ?? items.length,
        page: response.page ?? 1,
        pageSize: response.pageSize ?? items.length,
        totalPages: response.totalPages ?? 1,
      };
    };

    try {
      return await request();
    } catch (error) {
      console.warn('Falling back to local mock product catalog:', error);
      return getFallbackProducts(options);
    }
  }

  static async getProductById(id: string): Promise<Product | null> {
    const request = async (): Promise<Product | null> => {
      const product = await apiRequest<BackendProduct>(`/api/v1/products/${id}`);
      return product ? mapBackendProduct(product) : null;
    };

    try {
      return await request();
    } catch (error) {
      console.warn('Falling back to local product lookup:', error);
      const product = (rawProducts as Product[]).find((p) => p.id === id);
      return product ?? null;
    }
  }

  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    const request = async (): Promise<Product[]> => {
      const response = await apiRequest<BackendProduct[]>('/api/v1/products/featured');
      return (response ?? []).slice(0, limit).map(mapBackendProduct);
    };

    try {
      return await request();
    } catch (error) {
      console.warn('Falling back to featured mock products:', error);
      return (rawProducts as Product[]).filter((p) => p.isFeatured).slice(0, limit);
    }
  }

  static async getRelatedProducts(currentId: string, category: string, limit = 4): Promise<Product[]> {
    const sameCat = (rawProducts as Product[]).filter((p) => p.id !== currentId && p.category === category);
    if (sameCat.length >= limit) return sameCat.slice(0, limit);

    const others = (rawProducts as Product[]).filter((p) => p.id !== currentId && p.category !== category);
    return [...sameCat, ...others].slice(0, limit);
  }

  static async getProductsForFaceShape(faceShape: string): Promise<Product[]> {
    const products = (rawProducts as Product[]).filter(
      (p) =>
        p.faceShapes?.some((fs) => fs.toLowerCase() === faceShape.toLowerCase()) ||
        p.isAiPick
    );

    return products;
  }
}
