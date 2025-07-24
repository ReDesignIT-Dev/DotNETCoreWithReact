import React from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FRONTEND_CATEGORY_URL } from "config";
import { useSelector } from "react-redux";
import { selectCategoryBreadcrumb } from "reduxComponents/reduxShop/Categories/selectors";
import { RootState } from "reduxComponents/store";

interface CategoryBreadcrumbProps {
  category: Category;
  includeSelf?: boolean;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ category, includeSelf = false }) => {
  const navigate = useNavigate();
  const breadcrumb = useSelector((state: RootState) => 
    selectCategoryBreadcrumb(state, category.id, includeSelf)
  );
  const handleNavigationClick = (slug: string, event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    navigate(categoryPath);
  };

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {breadcrumb.map((_, index, arr) => {
          const ancestor = arr[index]; // Get the element from the back
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
