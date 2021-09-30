import {
  Slicer as SlicerEntity,
  PayeeSlicer,
  Product,
  ProductPurchase,
  Payee,
  TokenReceived,
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
  ERC721Received as ERC721ReceivedEvent,
  ERC1155Received as ERC1155ReceivedEvent,
  ERC1155BatchReceived as ERC1155BatchReceivedEvent,
} from "../../generated/templates/Slicer/Slicer"
import { BigInt, Bytes, dataSource } from "@graphprotocol/graph-ts"

export function handlePaymentReceived(event: PaymentReceivedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)
  let buyerAddress = event.params.from.toHexString()

  let payee = Payee.load(buyerAddress)
  if (!payee) {
    payee = new Payee(buyerAddress)
    payee.save()
  }

  let payeeSlicer = PayeeSlicer.load(slicerId + "-" + buyerAddress)
  if (!payeeSlicer) {
    payeeSlicer = new PayeeSlicer(slicerId + "-" + buyerAddress)
    payeeSlicer.payee = buyerAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = BigInt.fromI32(0)
  }
  slicer.totalReceived = slicer.totalReceived.plus(event.params.amount)
  payeeSlicer.totalPaid = payeeSlicer.totalPaid.plus(event.params.amount)
  slicer.save()
  payeeSlicer.save()
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

// Todo: fix
export function handleAddedChildrenSlicer(
  event: AddedChildrenSlicerEvent
): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)
  slicer.childrenSlicers.push(event.params.slicerId.toString())
  slicer.save()
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

  let payee = Payee.load(buyerAddress)
  if (!payee) {
    payee = new Payee(buyerAddress)
    payee.save()
  }
  let pp = ProductPurchase.load(productId + "-" + buyerAddress)
  if (!pp) {
    pp = new ProductPurchase(productId + "-" + buyerAddress)
    pp.product = productId
    pp.buyerSlicer = slicerId + "-" + buyerAddress
    pp.buyer = buyerAddress
    // pp.hash = []
    pp.quantity = BigInt.fromI32(0)
  }

  let payeeSlicer = PayeeSlicer.load(slicerId + "-" + buyerAddress)
  if (!payeeSlicer) {
    payeeSlicer = new PayeeSlicer(slicerId + "-" + buyerAddress)
    payeeSlicer.payee = buyerAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = BigInt.fromI32(0)
  }
  payeeSlicer.totalPaidProducts = payeeSlicer.totalPaidProducts.plus(
    event.params.productPrice
  )
  // pp.hash.push(event.transaction.hash)
  pp.quantity = pp.quantity.plus(quantity)
  pp.lastPurchasedAtTimestamp = event.block.timestamp
  pp.save()
  payeeSlicer.save()
}

export function handleERC721Received(event: ERC721ReceivedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let contract = event.params.contractAddress.toHexString()
  let tokenId = event.params.tokenId.toString()

  let tokenReceived = TokenReceived.load(
    slicerId + "-" + contract + "-" + tokenId
  )
  if (!tokenReceived) {
    tokenReceived = new TokenReceived(slicerId + "-" + contract + "-" + tokenId)
    tokenReceived.slicer = slicerId
    tokenReceived.contract = event.params.contractAddress
    tokenReceived.tokenId = event.params.tokenId
    tokenReceived.quantity = BigInt.fromI32(1)
    tokenReceived.isERC721 = true
  }
  tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
  tokenReceived.save()
}

export function handleERC1155Received(event: ERC1155ReceivedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let contract = event.params.contractAddress.toHexString()
  let tokenId = event.params.tokenId.toString()
  let amount = event.params.amount

  let tokenReceived = TokenReceived.load(
    slicerId + "-" + contract + "-" + tokenId
  )
  if (!tokenReceived) {
    tokenReceived = new TokenReceived(slicerId + "-" + contract + "-" + tokenId)
    tokenReceived.slicer = slicerId
    tokenReceived.contract = event.params.contractAddress
    tokenReceived.tokenId = event.params.tokenId
    tokenReceived.quantity = amount
    tokenReceived.isERC721 = false
  } else {
    tokenReceived.quantity = tokenReceived.quantity.plus(amount)
  }
  tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
  tokenReceived.save()
}
export function handleERC1155BatchReceived(
  event: ERC1155BatchReceivedEvent
): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let contract = event.params.contractAddress.toHexString()
  let tokenIds = event.params.tokenIds
  let amounts = event.params.amounts

  for (let i = 0; i < tokenIds.length; i++) {
    let tokenId = tokenIds[i].toString()
    let amount = amounts[i]

    let tokenReceived = TokenReceived.load(
      slicerId + "-" + contract + "-" + tokenId
    )
    if (!tokenReceived) {
      tokenReceived = new TokenReceived(
        slicerId + "-" + contract + "-" + tokenId
      )
      tokenReceived.slicer = slicerId
      tokenReceived.contract = event.params.contractAddress
      tokenReceived.tokenId = tokenIds[i]
      tokenReceived.quantity = amount
      tokenReceived.isERC721 = false
    } else {
      tokenReceived.quantity = tokenReceived.quantity.plus(amount)
    }
    tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
    tokenReceived.save()
  }
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
