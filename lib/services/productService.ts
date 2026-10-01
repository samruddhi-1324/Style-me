import { products as rawProducts } from '@/data/products';
import { Product, ProductFilterOptions, ProductListResponse } from '@/lib/types/product';

/**
 * ProductService
 * Enterprise API-ready abstraction for managing product data.
 * Fully prepared for Spring Boot / REST API migration.
 */
export class ProductService {
  /**
   * Fetch products with optional filtering, sorting, and pagination
   */
  static async getProducts(options: ProductFilterOptions = {}): Promise<ProductListResponse> {
    // Simulate slight network delay for realistic async flow
    await new Promise((res) => setTimeout(res, 50));

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

    // Apply Sorting
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
          result.sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0));
          break;
        case 'featured':
        default:
          result.sort((a, b) => (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0));
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
  }

  /**
   * Get product by unique ID
   */
  static async getProductById(id: string): Promise<Product | null> {
    await new Promise((res) => setTimeout(res, 20));
    const product = rawProducts.find((p) => p.id === id);
    return (product as Product) || null;
  }

  /**
   * Get featured products for home page banner / grids
   */
  static async getFeaturedProducts(limit = 6): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 20));
    return (rawProducts as Product[]).filter((p) => p.isFeatured).slice(0, limit);
  }

  /**
   * Get related products for PDP recommendations
   */
  static async getRelatedProducts(currentId: string, category: string, limit = 4): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 30));
    const sameCat = (rawProducts as Product[]).filter((p) => p.id !== currentId && p.category === category);
    if (sameCat.length >= limit) return sameCat.slice(0, limit);
    
    // Fill remaining with other products if needed
    const others = (rawProducts as Product[]).filter((p) => p.id !== currentId && p.category !== category);
    return [...sameCat, ...others].slice(0, limit);
  }

  /**
   * Get products recommended for specific face shape
   */
  static async getProductsForFaceShape(faceShape: string): Promise<Product[]> {
    await new Promise((res) => setTimeout(res, 40));
    return (rawProducts as Product[]).filter((p) => 
      p.faceShapes?.some((fs) => fs.toLowerCase() === faceShape.toLowerCase()) ||
      p.isAiPick
    );
  }
}
