import {
  Product,
  ProductPrices,
  CurrencySlicer,
  ProductCategory
} from "../../generated/schema"
import {
  ProductAdded as ProductAddedEvent,
  ProductInfoChanged as ProductInfoChangedEvent,
  CategorySet as CategorySetEvent
} from "../../generated/ProductsModuleV4/ProductsModule"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"

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
  let categoryName = event.params.name

  let category = ProductCategory.load(categoryId)
  if (!category) {
    category = new ProductCategory(categoryId)
  }

  category.name = categoryName

  category.save()
}
