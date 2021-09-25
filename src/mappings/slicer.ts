import {
  Slicer as SlicerEntity,
  PayeeSlicer,
  Product,
  ProductPurchase,
} from "../../generated/schema"
import {
  PaymentReceived as PaymentReceivedEvent,
  TriggeredRelease as TriggeredSlicerReleaseEvent,
  AddedChildrenSlicer as AddedChildrenSlicerEvent,
  ProductAdded as ProductAddedEvent,
  ProductInfoChanged as ProductInfoChangedEvent,
  ProductCurrencyChanged as ProductCurrencyChangedEvent,
  ProductCategoryChanged as ProductCategoryChangedEvent,
  ProductRemoved as ProductRemovedEvent,
  ProductPaid as ProductPaidEvent,
} from "../../generated/templates/Slicer/Slicer"
import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"

export function handlePaymentReceived(event: PaymentReceivedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)
  slicer.totalReceived = slicer.totalReceived.plus(event.params.amount)
  slicer.save()
}

export function handleTriggeredSlicerRelease(
  event: TriggeredSlicerReleaseEvent
): void {
  let payeeAddress = event.params.payee.toHexString()
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let ps = PayeeSlicer.load(slicerId + "-" + payeeAddress)
  ps.released = ps.released.plus(event.params.released)
  ps.save()
}

export function handleAddedChildrenSlicer(
  event: AddedChildrenSlicerEvent
): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)
  slicer.childrenSlicers.push(event.params.slicerId.toString())
}

export function handleProductAdded(event: ProductAddedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let product = new Product(slicerId + "-" + event.params.productId.toString())
  let subSlicers = event.params.subSlicersId
  let subProducts = event.params.subProducts
  product.slicer = slicerId
  product.categoryIndex = event.params.categoryIndex
  product.price = event.params.price
  product.isUSD = event.params.isUSD
  product.isInfinite = event.params.isInfinite
  product.isMultiple = event.params.isMultiple
  product.availableUnits = event.params.availableUnits
  product.creator = event.params.creator
  product.data = event.params.data
  product.totalPurchases = BigInt.fromI32(0)
  product.createdAtTimestamp = event.block.timestamp
  product.subProducts = []
  for (let i = 0; i < subSlicers.length; i++) {
    product.subProducts.push(
      subSlicers[i].toString() + "-" + subProducts[i].toString()
    )
  }
  product.save()
}

export function handleProductInfoChanged(event: ProductInfoChangedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let product = Product.load(slicerId + "-" + event.params.productId.toString())
  product.isInfinite = event.params.isInfinite
  product.availableUnits = event.params.units
  product.price = event.params.productPrice
  product.save()
}

export function handleProductCurrencyChanged(
  event: ProductCurrencyChangedEvent
): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let product = Product.load(slicerId + "-" + event.params.productId.toString())
  product.isUSD = event.params.isUSD
  product.price = event.params.productPrice
  product.save()
}

export function handleProductCategoryChanged(
  event: ProductCategoryChangedEvent
): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let product = Product.load(slicerId + "-" + event.params.productId.toString())
  product.categoryIndex = event.params.categoryIndex
  product.save()
}

export function handleProductRemoved(event: ProductRemovedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let product = Product.load(slicerId + "-" + event.params.productId.toString())
  product.availableUnits = BigInt.fromI32(0)
  product.categoryIndex = BigInt.fromI32(0)
  product.data = new Bytes(0)
  product.isInfinite = false
  product.isMultiple = false
  product.isUSD = false
  product.price = BigInt.fromI32(0)
  product.save()
}

export function handleProductPaid(event: ProductPaidEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let productId = slicerId + "-" + event.params.productId.toString()
  let buyerAddress = event.params.from.toHexString()
  let quantity = BigInt.fromI32(event.params.quantity)

  let product = Product.load(productId)
  product.totalPurchases = product.totalPurchases.plus(quantity)
  product.save()

  let pp = ProductPurchase.load(productId + "-" + buyerAddress)
  if (!pp) {
    pp = new ProductPurchase(productId + "-" + buyerAddress)
    pp.product = productId
    pp.buyer = slicerId + "-" + buyerAddress
    // pp.hash = []
    pp.quantity = BigInt.fromI32(0)
  }
  // pp.hash.push(event.transaction.hash)
  pp.quantity = pp.quantity.plus(quantity)
  pp.save()
}

// export function handleSLCPaid(event: SLCPaidEvent): void {
//   let entity = new SLCPaid(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   )
//   entity.serviceIds = event.params.serviceIds
//   entity.quantities = event.params.quantities
//   entity.amount = event.params.amount
//   entity.save()
// }

// Todo: Remove slicer from payees when slicer owned = 0?
