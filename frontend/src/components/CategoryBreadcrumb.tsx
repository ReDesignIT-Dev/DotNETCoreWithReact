import React, { useEffect, useState } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { FRONTEND_CATEGORY_URL } from "config";
import { getCategoryPath } from "services/shopServices/apiRequestsShop";

interface CategoryBreadcrumbProps {
  categoryId: number;
  includeSelf?: boolean;
}

const CategoryBreadcrumb: React.FC<CategoryBreadcrumbProps> = ({ categoryId, includeSelf = false }) => {
  const navigate = useNavigate();
  const handleNavigationClick = (slug: string, event: React.MouseEvent<HTMLSpanElement>) => {
    event.stopPropagation();
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    navigate(categoryPath);
  };
  const [breadcrumb, setBreadcrumb] = useState<CategoryPath[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null); // This was missing too

  useEffect(() => {
    const fetchCategoryPath = async () => {
      try {
        setIsLoading(true);
        setError(null);

        const response = await getCategoryPath(categoryId, includeSelf);

        if (response?.data) {
          setBreadcrumb(response.data);
        } else {
          setError("Failed to load category path");
        }
      } catch (err) {
        setError("Error loading breadcrumb");
        console.error("Error fetching category path:", err);
      } finally {
        setIsLoading(false);
      }
    };

    if (categoryId) {
      fetchCategoryPath();
    }
  }, [categoryId, includeSelf]);

  if (isLoading) {
    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item">Loading...</li>
        </ol>
      </nav>
    );
  }

  if (error) {
    return (
      <nav aria-label="breadcrumb">
        <ol className="breadcrumb">
          <li className="breadcrumb-item text-danger">{error}</li>
        </ol>
      </nav>
    );
  }

  return (
    <nav aria-label="breadcrumb">
      <ol className="breadcrumb">
        {breadcrumb.map((pathItem, index) => {
          const isLast = index === breadcrumb.length - 1;

          return (
            <li key={pathItem.id} className={`breadcrumb-item ${isLast ? "active" : ""}`} {...(isLast && { "aria-current": "page" })}>
              {isLast ? (
                <span>{pathItem.shortName}</span>
              ) : (
                <span role="button" className="text-primary cursor-pointer" onClick={(event) => handleNavigationClick(pathItem.slug, event)}>
                  {pathItem.shortName}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
};

export default CategoryBreadcrumb;
