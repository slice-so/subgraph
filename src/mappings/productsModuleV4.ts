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
} from "../../generated/ProductsModuleV4/ProductsModule"
import { BigInt, Bytes, store } from "@graphprotocol/graph-ts"

export function handleProductAddedV4(event: ProductAddedEvent): void {
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
  let productTypeId = BigInt.fromI32(
    event.params.params.productTypeId
  ).toHexString()
  let address0 = new Bytes(20)
  let slicerProductId = slicerId + "-" + productId
  let subProducts: string[] = []

  let product = new Product(slicerProductId)

  product.slicer = slicerId
  product.category = categoryId
  product.productType = productTypeId
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

export function handleProductInfoChangedV4(
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
  let productTypeId = params.productTypeId.toHexString()

  let product = Product.load(slicerProductId)!

  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.availableUnits = availableUnits
  product.referralFeeProduct = referralFeeProduct
  product.category = categoryId
  product.productType = productTypeId

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
  let parentCategoryId = BigInt.fromI32(
    event.params.parentCategoryId
  ).toHexString()
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

    if (parentCategoryId != "0x0") {
      let parentCategory = ProductCategory.load(parentCategoryId)!
      category.parentCategory = parentCategoryId

      // 1. Add direct parent relationship (depth 1)
      // 2. Add new relationships for each ancestor (depth 2+)
      updateCategoryHierarchy(parentCategory, category)
    }
  } else if (parentCategoryId != category.parentCategory) {
    // edit category when parent category changes

    // 1. Clear hierarchies (skip if without parent)
    //    - category with ancestors (except self) (depth 1+)
    //    - descendants with ancestors (depth 2+)
    if (category.parentCategory) {
      let currentParentCategory = ProductCategory.load(
        category.parentCategory!
      )!
      clearCategoryHierarchy(currentParentCategory, category)
    }

    // 2. Update parent category
    //    - if parentCategoryId is 0, set parentCategory to null
    const isParentCategoryNull = parentCategoryId == "0x0"
    category.parentCategory = isParentCategoryNull ? null : parentCategoryId

    // 3. Add new hierarchies
    //    - category with parent (depth 1)
    //    - category with ancestors (depth 2+)
    //    - descendants with ancestors (depth 2+)
    let newParentCategory = isParentCategoryNull
      ? null
      : ProductCategory.load(parentCategoryId)!
    updateCategoryHierarchy(newParentCategory || null, category)
  }

  category.name = categoryName
  category.save()
}

function updateCategoryHierarchy(
  parent: ProductCategory | null, // eg 3
  category: ProductCategory // eg 4
): void {
  let parentAncestors: string[] = []
  if (parent) {
    parentAncestors = parent.ancestors
  }
  let categoryDescendants = category.descendants

  parentAncestors.forEach((pa) => {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = ProductCategoryHierarchy.load(pa)!

    categoryDescendants.forEach((cd) => {
      // 4-4, 4-5, 4-6
      let categoryDescendantHierarchy = ProductCategoryHierarchy.load(cd)!

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let newId = `${parentAncestorHierarchy.ancestor}-${categoryDescendantHierarchy.descendant}`

      let hierarchy = new ProductCategoryHierarchy(newId)
      hierarchy.ancestor = parentAncestorHierarchy.ancestor
      hierarchy.descendant = categoryDescendantHierarchy.descendant
      hierarchy.depth = parentAncestorHierarchy.depth.plus(
        categoryDescendantHierarchy.depth.plus(BigInt.fromI32(1))
      )
      hierarchy.save()
    })
  })
}

function clearCategoryHierarchy(
  parent: ProductCategory | null, // eg 3
  category: ProductCategory // eg 4
): void {
  let parentAncestors: string[] = []
  if (parent) {
    parentAncestors = parent.ancestors
  }
  let categoryDescendants = category.descendants

  parentAncestors.forEach((pa) => {
    // 3-3, 2-3, 1-3
    let parentAncestorHierarchy = ProductCategoryHierarchy.load(pa)!

    categoryDescendants.forEach((cd) => {
      // 4-4, 4-5, 4-6
      let categoryDescendantHierarchy = ProductCategoryHierarchy.load(cd)!

      // 3-4, 3-5, 3-6 --> 2-4, 2-5, 2-6 --> 1-4, 1-5, 1-6
      let idToRemove = `${parentAncestorHierarchy.ancestor}-${categoryDescendantHierarchy.descendant}`

      store.remove("ProductCategoryHierarchy", idToRemove)
    })
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
