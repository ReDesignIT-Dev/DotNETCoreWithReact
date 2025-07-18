import "./CategoryTopBar.css";
import CategoryBreadcrumb from "./CategoryBreadcrumb";

interface CategoryTopBarProps{
  category: Category | null;
}

export default function CategoryTopBar({category}: CategoryTopBarProps) {
  
  return (
    <div>
      <h1>{category? category.name: "Missing Category info :("}</h1>
      {category? <CategoryBreadcrumb category={category} includeSelf={true} /> : "Category missing"}
    </div>
  );
}