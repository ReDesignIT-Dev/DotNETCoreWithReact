import "./CategoryTopBar.css";
import CategoryBreadcrumb from "./CategoryBreadcrumb";

interface CategoryTopBarProps{
  category: CategoryTree | null;
}

export default function CategoryTopBar({category}: CategoryTopBarProps) {
  
  return (
    <div>
      <h1>{category? category.name: "Missing Category info :("}</h1>
      {category? <CategoryBreadcrumb categoryId={category.id} includeSelf={true} /> : "Category missing"}
    </div>
  );
}