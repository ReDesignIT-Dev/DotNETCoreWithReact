interface Image {
  id: number;
  url: string;
  thumbnailUrl: string;
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
  readonly childrenIds: number[] | null;
  readonly ancestors: CategoryAncestor[];
  readonly parentId: number | null;
}

interface CategoryNode extends BaseCategory {
  readonly children: CategoryNode[] | null;
}

interface CategoryState {
  readonly flat: Category[];
  readonly tree: CategoryWithChildren[];
  readonly isLoading: boolean;
  readonly error: boolean;
  readonly lastUpdated: number | null;
}

interface CategoryWithChildren extends Category {
  readonly children: CategoryWithChildren[];
}

interface CategoryAncestor {
  readonly name: string;
  readonly shortName: string;
  readonly slug: string;
}