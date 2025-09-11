import { MouseEvent } from "react";
import { generatePath } from "react-router-dom";
import { FRONTEND_PRODUCT_URL, FRONTEND_CATEGORY_URL } from "config"; // Add FRONTEND_CATEGORY_URL to your config

export const navigateToProduct = (
  slug: string,
  event: MouseEvent<HTMLElement>,
  navigate: (path: string) => void
) => {
  event.stopPropagation();
  const productPath = generatePath(FRONTEND_PRODUCT_URL, { slug });
  navigate(productPath);
};

export const navigateToCategory = (
  slug: string,
  event: MouseEvent<HTMLElement>,
  navigate: (path: string) => void
) => {
  event.stopPropagation();
  const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
  navigate(categoryPath);
};