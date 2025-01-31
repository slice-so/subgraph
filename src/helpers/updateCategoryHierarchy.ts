import { BigInt, store } from "@graphprotocol/graph-ts"
import { ProductCategoryHierarchy } from "../../generated/schema"
import { ProductCategory } from "../../generated/schema"

export function updateCategoryHierarchy(
  parent: ProductCategory | null, // eg 3
  category: ProductCategory // eg 4
): void {
  let parentAncestors: ProductCategoryHierarchy[] = []
  if (parent) {
    parentAncestors = parent.ancestors.load()
  }
  let categoryDescendants = category.descendants.load()

  for (let i = 0; i < parentAncestors.length; i++) {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = parentAncestors[i]
    for (let j = 0; j < categoryDescendants.length; j++) {
      // 4-4, 4-5, 4-6
      let categoryDescendantHierarchy = categoryDescendants[j]

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let newId = `${parentAncestorHierarchy.ancestor}-${categoryDescendantHierarchy.descendant}`

      let hierarchy = new ProductCategoryHierarchy(newId)
      hierarchy.ancestor = parentAncestorHierarchy.ancestor
      hierarchy.descendant = categoryDescendantHierarchy.descendant
      hierarchy.depth = parentAncestorHierarchy.depth.plus(
        categoryDescendantHierarchy.depth.plus(BigInt.fromI32(1))
      )
      hierarchy.save()
    }
  }
}

export function clearCategoryHierarchy(
  parent: ProductCategory | null, // eg 3
  category: ProductCategory // eg 4
): void {
  let parentAncestors: ProductCategoryHierarchy[] = []
  if (parent) {
    parentAncestors = parent.ancestors.load()
  }
  let categoryDescendants = category.descendants.load()

  for (let i = 0; i < parentAncestors.length; i++) {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = parentAncestors[i]
    for (let j = 0; j < categoryDescendants.length; j++) {
      // 4-4, 4-5, 4-6
      let categoryDescendantHierarchy = categoryDescendants[j]

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let idToRemove = `${parentAncestorHierarchy.ancestor}-${categoryDescendantHierarchy.descendant}`

      store.remove("ProductCategoryHierarchy", idToRemove)
    }
  }
}
