/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export type CategoryType = 'minipc' | 'minicase' | 'laptop';

export type UseCaseType = 'office' | 'gaming' | 'engineering' | 'portable';

export interface ProductSpecs {
  cpu: string;
  ram: string;
  storage: string;
  gpu: string;
  ports: string[];
  dimensions: string;
  weight: string;
  power: string;
  os: string;
  cooling: string;
}

export interface Product {
  id: string;
  name: string;
  englishName: string;
  category: CategoryType;
  useCase: UseCaseType;
  price: number; // in Tomans
  discountPrice?: number; // if has discount
  brand: string;
  rating: number;
  reviewCount: number;
  stockStatus: 'available' | 'low' | 'unavailable';
  shortDescription: string;
  longDescription: string;
  keyFeatures: string[];
  specs: ProductSpecs;
  warranty: string;
}

export interface FilterState {
  searchQuery: string;
  categories: CategoryType[];
  useCases: UseCaseType[];
  brands: string[];
  minPrice: number;
  maxPrice: number;
  sortBy: 'popular' | 'priceAsc' | 'priceDesc' | 'rating';
}

export interface CartItem {
  product: Product;
  quantity: number;
}
