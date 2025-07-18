/**
 * Returns the list of ancestors for a given category.
 * @param category - The category from which to get ancestors.
 * @param includeSelf - If true, the returned list will include the given category as the last element.
 * @returns An array of CategoryAncestor objects.
 */
export function getCategoryAncestors(category: Category, includeSelf: boolean = false): CategoryAncestor[] {
  // Copy the ancestors array from the category.
  const ancestors: CategoryAncestor[] = [...category.ancestors];
  
  // Optionally include the current category.
  if (includeSelf) {
    ancestors.unshift({name: category.name, shortName: category.shortName, slug: category.slug });
  }
  return ancestors;
}
