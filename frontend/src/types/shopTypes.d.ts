interface Image {
  id: number;
  src: string;
  altText?: string;
  position?: number;
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

interface BaseCategory {
  readonly id: number;
  readonly slug: string;
  readonly name: string;
  readonly shortName: string;
  readonly productCount: number;

}

interface Category extends BaseCategory {
  readonly image?: Image;
  readonly children: number[] | null;
  readonly ancestors: CategoryAncestor[];
  readonly parentId: number | null;
}

interface CategoryNode extends BaseCategory {
  readonly children: CategoryNode[] | null;
}

interface CategoryTreeStore {
  readonly categories: CategoryNode[];
  readonly isLoading: boolean;
  readonly error: boolean;
}

interface CategoryStore {
  readonly categories: Category[];
  readonly isLoading: boolean;
  readonly error: boolean;
}

interface CategoryAncestor {
  readonly name: string;
  readonly shortName: string;
  readonly slug: string;
}