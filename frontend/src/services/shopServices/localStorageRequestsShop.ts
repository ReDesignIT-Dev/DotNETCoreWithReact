// localStorageRequestsShop.ts
import { createSafeImage } from '../../utils/imageUtils';

const CART_STATE_KEY = 'localCart';

export const loadState = (): CartItem[] | undefined => {
  try {
    const serializedState = localStorage.getItem(CART_STATE_KEY);
    if (serializedState === null) {
      return undefined;
    }
    return JSON.parse(serializedState);
  } catch (err) {
    console.error("Could not load state from local storage", err);
    return undefined;
  }
};

export const saveState = (state: CartItem[]) => {
  try {
    const serializedState = JSON.stringify(state);
    localStorage.setItem(CART_STATE_KEY, serializedState);
  } catch (err) {
    console.error("Could not save state to local storage", err);
  }
};

export const addItemToCart = (product: Product, quantity = 1) => {
  const cart = loadState() || [];
  const existingItemIndex = cart.findIndex(item => item.product.id === product.id);

  // Use imageUtils to safely handle the main image
  const safeImage = createSafeImage(product.images[0], product.name);

  // Map Product to CartProduct
  const cartProduct: CartProduct = {
    id: product.id,
    slug: product.slug,
    name: product.name,
    price: product.price,
    mainImageUrl: safeImage.url,
    mainImageThumbnailUrl: safeImage.thumbnailUrl,
    mainImageAltText: safeImage.altText
  };

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
  } else {
    cart.push({ product: cartProduct, quantity });
  }
  saveState(cart);
};

export const removeItemFromCart = (productId: number) => {
  let cart = loadState() || [];
    cart = cart.filter(item => item.product.id !== productId);
  saveState(cart);
};

export const updateItemQuantity = (productId: number, quantity: number) => {
  const cart = loadState() || [];
    const existingItemIndex = cart.findIndex(item => item.product.id === productId);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity = quantity;
  }

  saveState(cart);
};

export const clearCart = () => {
  localStorage.removeItem(CART_STATE_KEY);
};

export const getCart = (): CartItem[] => {
  return loadState() || [];
};