interface Image {
  id: number;
  url: string;
  thumbnailUrl: string;
  altText?: string | null;
  position?: number | null;
}

interface BaseProductFields {
  name: string;
  categoryId: number;
  description: string;
  price: number;
  saleStart?: Date | null;
  saleEnd?: Date | null;
  isOnSale: boolean;
}

interface Product extends BaseProductFields {
  id: number;
  slug: string;
  images: Image[];
}

interface ProductFormData extends BaseProductFields {
  images: File[];
}


interface CartItem {
  product: Product;
  quantity: number;
}

interface Category {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly productCount: number;
  readonly image?: Image;
  readonly parentId: number | null;
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