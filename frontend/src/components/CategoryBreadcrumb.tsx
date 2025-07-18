import React from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { getCategoryAncestors } from "utils/CategoryHelper";
import { FRONTEND_CATEGORY_URL } from "config";

interface CategoryBreadcrumbProps {
  category: Category;
  includeSelf?: boolean;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ category, includeSelf = false }) => {
  const navigate = useNavigate();
  const ancestors = getCategoryAncestors(category, includeSelf);

  const handleNavigationClick = (slug: string, event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    navigate(categoryPath);
  };

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {ancestors.map((_, index, arr) => {
          const ancestor = arr[arr.length - 1 - index]; // Get the element from the back
          return (
            <li key={index} className="breadcrumb-item">
              <span role="button" onClick={(event) => handleNavigationClick(ancestor.slug, event)}>
                {ancestor.shortName}
              </span>
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CategoryBreadcrumb;
