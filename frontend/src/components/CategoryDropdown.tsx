import React, { MouseEvent } from "react";
import { generatePath, useNavigate } from "react-router-dom";
import { useSelector } from "react-redux";
import "./CategoryDropdown.css";
import {
  MDBDropdown,
  MDBDropdownToggle,
  MDBDropdownMenu,
  MDBDropdownItem,
  MDBContainer,
} from "mdb-react-ui-kit";
import { FRONTEND_CATEGORY_URL } from "config";
import {
  selectCategoriesIsLoading,
  selectTreeCategories,
  selectCategoriesError,
} from "reduxComponents/reduxShop/Categories/selectors";

const CategoryDropdown: React.FC = () => {
  const categories = useSelector(selectTreeCategories);
  const isLoading = useSelector(selectCategoriesIsLoading);
  const error = useSelector(selectCategoriesError);
  const navigate = useNavigate();

  const handleItemClick = (slug: string, event: MouseEvent<HTMLLIElement>) => {
    event.stopPropagation();
    const categoryPath = generatePath(FRONTEND_CATEGORY_URL, { slug });
    navigate(categoryPath);
  };


  if (isLoading) return <p>Loading...</p>;
  if (error) return <p>Error loading categories.</p>;

  const renderCategories = () => {
    if (!categories || categories.length === 0 || !categories[0].children) {
      return null;
    }
    return (
      <MDBContainer fluid style={{ padding: 0, marginTop: "10px" }}>
        <MDBDropdown animation={false}>
          <MDBDropdownToggle>Categories</MDBDropdownToggle>
          <MDBDropdownMenu>
            {renderCategoryTree(categories)}
          </MDBDropdownMenu>
        </MDBDropdown>
      </MDBContainer>
    );
  };

  const renderCategoryTree = (categories: CategoryTree[]): JSX.Element => {
    return (
      <>
        {categories.map((category) => (
          
          <MDBDropdownItem
            key={category.slug}
            className="dropdown-item"
            onClick={(event) =>
              handleItemClick(category.slug, event as MouseEvent<HTMLLIElement>)
            }
          >
            <span style={{ display: "flex", justifyContent: "space-between" }}>
              {category.name}
              {category.children && category.children.length > 0 && (
                <span>&raquo;</span>
              )}
            </span>
            {category.children && category.children.length > 0 && (
              <ul className="dropdown-menu dropdown-submenu">
                {category.children.map((child: CategoryTree) => (
                  <MDBDropdownItem
                    key={child.slug}
                    className="dropdown-item"
                    onClick={(event) =>
                      handleItemClick(
                        child.slug,
                        event as MouseEvent<HTMLLIElement>
                      )
                    }
                  >
                    <span
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                      }}
                    >
                      {child.name}{" "}
                      {child.children && child.children.length > 0 && (
                        <span>&raquo;</span>
                      )}
                    </span>
                    {child.children && child.children.length > 0 && (
                      <ul className="dropdown-menu dropdown-submenu">
                        {renderCategoryTree(child.children)}
                      </ul>
                    )}
                  </MDBDropdownItem>
                ))}
              </ul>
            )}
          </MDBDropdownItem>
        ))}
      </>
    );
  };

  return <>{renderCategories()}</>;
};

export default CategoryDropdown;
