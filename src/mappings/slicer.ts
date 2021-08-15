import {
  PaymentReceived as PaymentReceivedEvent,
  TriggeredRelease as TriggeredSlicerReleaseEvent,
  SLCPaid as SLCPaidEvent,
  AddedChildrenSlicer as AddedChildrenSlicerEvent,
  ProductAdded as ProductAddedEvent,
  ProductInfoChanged as ProductInfoChangedEvent,
  ProductCurrencyChanged as ProductCurrencyChangedEvent,
  ProductCategoryChanged as ProductCategoryChangedEvent,
  ProductRemoved as ProductRemovedEvent,
  ProductPaid as ProductPaidEvent,
} from "../../generated/templates/Slicer/Slicer"
import {
  Slicer as SlicerEntity,
  Payee,
  PayeeSlicer,
  Product,
} from "../../generated/schema"
import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"

export function handlePaymentReceived(event: PaymentReceivedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)
  slicer.totalReceived = slicer.totalReceived.plus(event.params.amount)
  slicer.save()
  // Todo: Also register event.params.from ?
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
  let product = new Product(event.params.productId.toString())
  // To Check
  product.slicer = slicerId
  product.availableUnits = event.params.availableUnits
  product.categoryIndex = event.params.categoryIndex
  product.creator = event.params.creator
  product.data = event.params.data
  product.isInfinite = event.params.isInfinite
  product.isMultiple = event.params.isMultiple
  product.isUSD = event.params.isUSD
  product.price = event.params.price
  product.save()
}

export function handleProductInfoChanged(event: ProductInfoChangedEvent): void {
  let product = Product.load(event.params.productId.toString())
  product.isInfinite = event.params.isInfinite
  product.availableUnits = event.params.units
  product.price = event.params.productPrice
  product.save()
}

export function handleProductCurrencyChanged(
  event: ProductCurrencyChangedEvent
): void {
  let product = Product.load(event.params.productId.toString())
  product.isUSD = event.params.isUSD
  product.price = event.params.productPrice
  product.save()
}

export function handleProductCategoryChanged(
  event: ProductCategoryChangedEvent
): void {
  let product = Product.load(event.params.productId.toString())
  product.categoryIndex = event.params.categoryIndex
  product.save()
}

export function handleProductRemoved(event: ProductRemovedEvent): void {
  let product = Product.load(event.params.productId.toString())
  product.availableUnits = BigInt.fromI32(0)
  product.categoryIndex = BigInt.fromI32(0)
  // product.data = Bytes.fromHexString("0x")
  product.isInfinite = false
  product.isMultiple = false
  product.isUSD = false
  product.price = BigInt.fromI32(0)
  product.save()
}

// export function handleProductPaid(event: ProductPaidEvent): void {
//   let entity = new ProductPaid(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   )
//   entity.from = event.params.from
//   entity.productId = event.params.productId
//   entity.quantity = event.params.quantity
//   entity.productPrice = event.params.productPrice
//   entity.save()
// }

// export function handleSLCPaid(event: SLCPaidEvent): void {
//   let entity = new SLCPaid(
//     event.transaction.hash.toHex() + "-" + event.logIndex.toString()
//   )
//   entity.serviceIds = event.params.serviceIds
//   entity.quantities = event.params.quantities
//   entity.amount = event.params.amount
//   entity.save()
// }
