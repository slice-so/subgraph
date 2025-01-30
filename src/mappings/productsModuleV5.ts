import {
  Product,
  ProductPrices,
  CurrencySlicer,
  ProductCategory,
  ProductCategoryHierarchy
} from "../../generated/schema"
import {
  ProductAdded as ProductAddedEvent,
  ProductInfoChanged as ProductInfoChangedEvent,
  CategorySet as CategorySetEvent
} from "../../generated/ProductsModuleV5/ProductsModule"
import { BigInt, Bytes, store } from "@graphprotocol/graph-ts"

export function handleProductAddedV5(event: ProductAddedEvent): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let creator = event.params.creator
  let params = event.params.params
  let subSlicerProducts = params.subSlicerProducts
  let currencyPrices = params.currencyPrices
  let data = params.data
  let availableUnits = params.availableUnits
  let maxUnitsPerBuyer = params.maxUnitsPerBuyer
  let isFree = params.isFree
  let isInfinite = params.isInfinite
  let isExternalCallPaymentRelative = params.isExternalCallPaymentRelative
  let isExternalCallPreferredToken = params.isExternalCallPreferredToken
  let externalCall = event.params.externalCall
  let referralFeeProduct = params.referralFeeProduct
  let categoryId = BigInt.fromI32(event.params.params.categoryId).toHexString()
  let address0 = new Bytes(20)
  let slicerProductId = slicerId + "-" + productId
  let subProducts: string[] = []

  let product = new Product(slicerProductId)

  product.slicer = slicerId
  product.category = categoryId
  product.isRemoved = false
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.extRelativePrice = isExternalCallPaymentRelative
  product.extPreferredToken = isExternalCallPreferredToken
  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.creator = creator
  product.data = data
  product.createdAtTimestamp = event.block.timestamp
  product.totalPurchases = BigInt.fromI32(0)
  product.availableUnits = isInfinite ? BigInt.fromI32(0) : availableUnits
  product.referralFeeProduct = referralFeeProduct

  if (externalCall.externalAddress != address0) {
    product.extAddress = externalCall.externalAddress
    product.extCheckSig = externalCall.checkFunctionSignature
    product.extExecSig = externalCall.execFunctionSignature
    product.extValue = externalCall.value
    product.extData = externalCall.data
  } else {
    product.extAddress = address0
    product.extCheckSig = new Bytes(0)
    product.extExecSig = new Bytes(0)
    product.extValue = BigInt.fromI32(0)
    product.extData = new Bytes(0)
  }

  for (let i = 0; i < subSlicerProducts.length; i++) {
    let subSlicerId = subSlicerProducts[i].subSlicerId.toHex()
    let subProductId = subSlicerProducts[i].subProductId.toHex()
    subProducts.push(subSlicerId + "-" + subProductId)
  }
  product.subProducts = subProducts

  for (let i = 0; i < currencyPrices.length; i++) {
    let currency = currencyPrices[i].currency.toHexString()
    let productPrice = new ProductPrices(slicerProductId + "-" + currency)
    productPrice.product = slicerProductId
    productPrice.currency = currency
    productPrice.price = currencyPrices[i].value
    productPrice.dynamicPricing = currencyPrices[i].dynamicPricing
    productPrice.externalAddress = currencyPrices[i].externalAddress
    productPrice.save()

    let currencySlicer = CurrencySlicer.load(currency + "-" + slicerId)
    if (!currencySlicer) {
      currencySlicer = new CurrencySlicer(currency + "-" + slicerId)
      currencySlicer.currency = currency
      currencySlicer.slicer = slicerId
      currencySlicer.released = BigInt.fromI32(0)
      currencySlicer.releasedUsd = BigInt.fromI32(0)
      currencySlicer.releasedToProtocol = BigInt.fromI32(0)
      currencySlicer.creatorFeePaid = BigInt.fromI32(0)
      currencySlicer.totalEarned = BigInt.fromI32(0)
      currencySlicer.save()
    }
  }

  product.save()
}

export function handleProductInfoChangedV5(
  event: ProductInfoChangedEvent
): void {
  const params = event.params.params
  let slicerId = params.slicerId.toHex()
  let productId = params.productId.toHex()
  let maxUnitsPerBuyer = params.newMaxUnits
  let isFree = params.isFree
  let isInfinite = params.isInfinite
  let availableUnits = params.newUnits
  let currencyPrices = event.params.currencyPrices
  let slicerProductId = slicerId + "-" + productId
  let referralFeeProduct = params.referralFeeProduct
  let categoryId = params.categoryId.toHexString()

  let product = Product.load(slicerProductId)!

  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.availableUnits = availableUnits
  product.referralFeeProduct = referralFeeProduct
  product.category = categoryId

  for (let i = 0; i < currencyPrices.length; i++) {
    let currency = currencyPrices[i].currency.toHexString()
    let productPrice = ProductPrices.load(slicerProductId + "-" + currency)
    if (!productPrice) {
      productPrice = new ProductPrices(slicerProductId + "-" + currency)
      productPrice.product = slicerProductId
      productPrice.currency = currency
    }
    productPrice.price = currencyPrices[i].value
    productPrice.dynamicPricing = currencyPrices[i].dynamicPricing
    productPrice.externalAddress = currencyPrices[i].externalAddress
    productPrice.save()

    let currencySlicer = CurrencySlicer.load(currency + "-" + slicerId)
    if (!currencySlicer) {
      currencySlicer = new CurrencySlicer(currency + "-" + slicerId)
      currencySlicer.currency = currency
      currencySlicer.slicer = slicerId
      currencySlicer.released = BigInt.fromI32(0)
      currencySlicer.releasedUsd = BigInt.fromI32(0)
      currencySlicer.releasedToProtocol = BigInt.fromI32(0)
      currencySlicer.creatorFeePaid = BigInt.fromI32(0)
      currencySlicer.totalEarned = BigInt.fromI32(0)
      currencySlicer.save()
    }
  }

  product.save()
}

export function handleCategorySet(event: CategorySetEvent): void {
  let categoryId = event.params.categoryId.toHexString()
  let parentCategoryId = event.params.parentCategoryId.toHexString()
  let categoryName = event.params.name
  let selfId = `${categoryId}-${categoryId}`

  let category = ProductCategory.load(categoryId)

  if (!category) {
    // Create new category
    category = new ProductCategory(categoryId)

    // Create self-reference (depth 0)
    let selfHierarchy = new ProductCategoryHierarchy(selfId)
    selfHierarchy.ancestor = categoryId
    selfHierarchy.descendant = categoryId
    selfHierarchy.depth = BigInt.fromI32(0)
    selfHierarchy.save()

    if (parentCategoryId != BigInt.fromI32(0)) {
      let parentCategory = ProductCategory.load(parentCategoryId)!
      category.parentCategory = parentCategoryId

      updateCategoryHierarchy(parentCategory, category)
    }
  } else if (categoryName.length == 0) {
    // delete category
    store.remove("ProductCategory", categoryId)
    store.remove("ProductCategoryHierarchy", selfId)

    // how to handle subproducts that have the category as ancestor?
  } else if (parentCategoryId != category.parentCategory) {
    // edit category when parent category changes
    let newParentCategory = ProductCategory.load(parentCategoryId)!
    updateCategoryHierarchy(newParentCategory, category)
  }

  category.name = categoryName
  category.save()
}

function updateCategoryHierarchy(
  parent: ProductCategory,
  category: ProductCategory
): void {
  let categoryAncestors = category.ancestors
  let categoryDescendants = category.descendants

  clearCategoryHierarchy(category)

  // Add direct parent relationship (depth 1)
  let directId = `${parent.id}-${category.id}`
  let directHierarchy = new ProductCategoryHierarchy(directId)
  directHierarchy.ancestor = parent.id
  directHierarchy.descendant = category.id
  directHierarchy.depth = BigInt.fromI32(1)
  directHierarchy.save()

  // Create new relationships for each parent ancestor
  // Get all ancestor paths from parent
  let parentAncestors = parent.ancestors
  parentAncestors.forEach((pa) => {
    let parentAncestorHierarchy = ProductCategoryHierarchy.load(pa)!
    let newId = `${parentAncestorHierarchy.ancestor}-${category.id}`
    let hierarchy = new ProductCategoryHierarchy(newId)
    hierarchy.ancestor = parentAncestorHierarchy.ancestor
    hierarchy.descendant = category.id
    hierarchy.depth = parentAncestorHierarchy.depth.plus(BigInt.fromI32(1))
    hierarchy.save()
  })

  categoryDescendants.forEach((cd) => {
    let categoryDescendantHierarchy = ProductCategoryHierarchy.load(cd)!
    categoryAncestors.forEach((ca) => {
      let categoryAncestorHierarchy = ProductCategoryHierarchy.load(ca)!
      let newId = `${categoryAncestorHierarchy.ancestor}-${categoryDescendantHierarchy.descendant}`

      let hierarchy = new ProductCategoryHierarchy(newId)
      hierarchy.ancestor = categoryAncestorHierarchy.ancestor
      hierarchy.descendant = categoryDescendantHierarchy.descendant
      hierarchy.depth = categoryAncestorHierarchy.depth.plus(BigInt.fromI32(1))
      hierarchy.save()
    })
  })
}

function clearCategoryHierarchy(category: ProductCategory): void {
  let categoryAncestors = category.ancestors
  category.ancestors.forEach((ca) => {
    let ancestorId = ca.split("-")[0]
    // remove all ancestors except self
    if (ancestorId != category.id) {
      store.remove("ProductCategoryHierarchy", ca)
    }
  })

  category.descendants.forEach((h) => {
    // remove all descendants from parent category upwards
    // if depth > category.depth, remove

    let descendantId = h.split("-")[1]
    // remove all descendants except self
    if (descendantId != category.id) {
      categoryAncestors.forEach((ca) => {
        let categoryAncestorHierarchy = ProductCategoryHierarchy.load(ca)!
        let categoryDescendantHierarchy = ProductCategoryHierarchy.load(h)!
        let hierarchy = ProductCategoryHierarchy.load(
          categoryAncestorHierarchy.ancestor +
            "-" +
            categoryDescendantHierarchy.descendant
        )!

        store.remove("ProductCategoryHierarchy", hierarchy.id)
      })
    }
  })
}

// 1 -> 2 [1], 1 -> 3 [2], 1 -> 4 [3], 1 -> 5 [4]
// 2 -> 3 [1], 2 -> 4 [2], 2 -> 5 [3]
// 3 -> 4 [1], 3 -> 5 [2]
// 4 -> 5 [1]

// CHANGE 4's parentId from 3 to 2

// 1 -> 2 [1], 1 -> 3 [2], 1 -> 4 [3], 1 -> 5 [4], 1 => 6[1]
// 2 -> 3 [1], 2 -> 4 [1], 2 -> 5 [2]
// 3 -> NO SUBCATEGORIES
// 4 -> 5 [1]

// if instead we change 4's parentId to 6

// 1 -> 2 [1], 1 -> 3 [2], 1 -> 6 [1]
// 2 -> 3 [1]
// 3 -> NO SUBCATEGORIES
// 4 -> 5 [1]
// 6 -> 4 [1], 6 -> 5 [2]

// descendant: 4-5
// category ancestors: 4-4[0], 6-4[1], 1-4[2]

// new ids = 4-5, 6-5, 1-5
// depts = 1, 2, 3
