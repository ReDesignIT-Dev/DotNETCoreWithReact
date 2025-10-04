// localStorageRequestsShop.ts

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
  const existingItemIndex = cart.findIndex(item => item.product.slug === product.slug);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity += quantity;
    // Recalculate itemTotal for existing item
    cart[existingItemIndex].itemTotal = cart[existingItemIndex].quantity * product.price;
  } else {
    // Calculate itemTotal for new item
    const itemTotal = quantity * product.price;
    cart.push({ product, quantity, itemTotal });
  }

  saveState(cart);
};

export const removeItemFromCart = (product: Product) => {
  let cart = loadState() || [];
  cart = cart.filter(item => item.product.slug !== product.slug);
  saveState(cart);
};

export const updateItemQuantity = (product: Product, quantity: number) => {
  const cart = loadState() || [];
  const existingItemIndex = cart.findIndex(item => item.product.slug === product.slug);

  if (existingItemIndex !== -1) {
    cart[existingItemIndex].quantity = quantity;
    // Recalculate itemTotal when quantity changes
    cart[existingItemIndex].itemTotal = quantity * product.price;
  }

  saveState(cart);
};

export const clearCart = () => {
  localStorage.removeItem(CART_STATE_KEY);
};

export const getCart = (): CartItem[] => {
  return loadState() || [];
};