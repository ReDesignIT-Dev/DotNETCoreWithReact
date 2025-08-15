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
    images?: File[];
}

interface CreateCategoryRequest {
    name: string;
    shortName: string;
    parentId?: number | null;
    image?: File | null;
}

interface UpdateProductRequest {
    name?: string;
    description?: string;
    price?: number;
    categoryId?: number;
    imagesToDelete?: number[];
    newImages?: File[];
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