interface CartItem {
    product: Product;
    quantity: number;
}

interface CategoryTree extends Category {
    readonly children: CategoryTree[];
}

interface CategoryPath {
    id: number;
    name: string;
    slug: string;
    shortName: string;
}
interface CategoryPaths {
    categoryPaths: CategoryPath[];
}

interface CreateCategoryData {
    name: string;
    shortName: string;
    parentId?: number | null;
    image?: File | null;
}

// ============= BACKEND RESPONSE TYPES =============
interface Product {  // corresponds to ReadProductDto
    id: number;
    name: string;
    description: string;
    price: number;
    categoryId: number;
    slug: string;
    images: ProductImage[];
}

interface Category {  // corresponds to ReadCategoryDto
    id: number;
    name: string;
    slug: string;
    image?: CategoryImage;
    parentId: number | null;
    shortName: string;
    productCount: number;
}

// ============= API REQUEST TYPES =============
interface CreateProductRequest {  // corresponds to WriteProductDto
    name: string;
    description: string;
    price: number;
    categoryId: number;
    images: File[]; 
}

interface UpdateProductRequest { // corresponds to UpdateProductDto
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    currentImages?: Record<number, number>; // Key: ImageId, Value: Position
    newImages?: File[];
}

interface CreateCategoryRequest {
    name: string;
    shortName: string;
    parentId?: number | null;
    image?: File | null;
}

interface UpdateCategoryRequest {
    name?: string;
    shortName?: string;
    parentId?: number | null;
    newImage?: File | null;
    removeCurrentImage?: boolean;
}

// ============= SPECIALIZED FRONTEND TYPES =============
interface CategoryTree extends Category {
    children: CategoryTree[];
}

interface ProductListResponse {
    count: number;
    totalPages: number;
    products: Product[];
}

// ============= SUPPORTING TYPES =============
interface Image {
    id: number;
    url: string;
    thumbnailUrl: string;
    altText?: string | null;

}
interface ProductImage extends Image{
    position?: number | null;
}

interface CategoryImage extends Image {

}

// ============= UI COMPONENT TYPES =============
interface ImageItem {
  id: number;
  url?: string;
  preview?: string;
  altText?: string;
  position?: number;
  name?: string;
  size?: number;
}

interface ImageFile extends File {
  preview: string;
  id: number;
  position: number;
}

// Add these interfaces to your existing types:

interface Cart {
    id: number;
    items: CartItem[];
    totalAmount: number;
    totalItems: number;
    updatedAt: string;
}

interface CartItem {
    id: number;
    productId: number;
    product: Product;
    quantity: number;
    itemTotal: number;
    addedAt: string;
    updatedAt: string;
}

interface AddToCartRequest {
    productId: number;
    quantity: number;
}

interface UpdateCartItemRequest {
    quantity: number;
}