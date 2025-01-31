import { BigInt, store } from "@graphprotocol/graph-ts"
import { ProductTypeHierarchy } from "../../generated/schema"
import { ProductType } from "../../generated/schema"

export function updateProductTypeHierarchy(
  slicerId: string,
  parent: ProductType | null, // eg 3
  productType: ProductType // eg 4
): void {
  let parentAncestors: ProductTypeHierarchy[] = []
  if (parent) {
    parentAncestors = parent.ancestors.load()
  }
  let productTypeDescendants = productType.descendants.load()

  for (let i = 0; i < parentAncestors.length; i++) {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = parentAncestors[i]
    for (let j = 0; j < productTypeDescendants.length; j++) {
      // 4-4, 4-5, 4-6
      let productTypeDescendantHierarchy = productTypeDescendants[j]

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let newId = `${slicerId}-${parentAncestorHierarchy.ancestor}-${productTypeDescendantHierarchy.descendant}`

      let hierarchy = new ProductTypeHierarchy(newId)
      hierarchy.ancestor = parentAncestorHierarchy.ancestor
      hierarchy.descendant = productTypeDescendantHierarchy.descendant
      hierarchy.depth = parentAncestorHierarchy.depth.plus(
        productTypeDescendantHierarchy.depth.plus(BigInt.fromI32(1))
      )
      hierarchy.slicer = slicerId
      hierarchy.save()
    }
  }
}

export function clearProductTypeHierarchy(
  slicerId: string,
  parent: ProductType | null, // eg 3
  productType: ProductType // eg 4
): void {
  let parentAncestors: ProductTypeHierarchy[] = []
  if (parent) {
    parentAncestors = parent.ancestors.load()
  }
  let productTypeDescendants = productType.descendants.load()

  for (let i = 0; i < parentAncestors.length; i++) {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = parentAncestors[i]
    for (let j = 0; j < productTypeDescendants.length; j++) {
      // 4-4, 4-5, 4-6
      let productTypeDescendantHierarchy = productTypeDescendants[j]

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let idToRemove = `${slicerId}-${parentAncestorHierarchy.ancestor}-${productTypeDescendantHierarchy.descendant}`

      store.remove("ProductTypeHierarchy", idToRemove)
    }
  }
}
