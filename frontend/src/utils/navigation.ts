import { MouseEvent } from "react";
import { generatePath } from "react-router-dom";
import { FRONTEND_PRODUCT_URL } from "config";

export const navigateToProduct = (
  slug: string, 
  event: MouseEvent<HTMLElement>, 
  navigate: (path: string) => void
) => {
  event.stopPropagation();
  const productPath = generatePath(FRONTEND_PRODUCT_URL, { slug });
  navigate(productPath);
};