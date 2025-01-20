import {
  Slicer as SlicerEntity,
  Payee,
  Product,
  PayeeSlicer,
  ProductPurchase,
  ProductPrices,
  CurrencySlicer,
  PayeeCurrency,
  PayeeSlicerCurrency,
  Order,
  TokenListing,
  PurchaseData,
  SlicerOrder
} from "../../generated/schema"
import {
  ProductAdded as ProductAddedEventV1,
  ProductInfoChanged as ProductInfoChangedEventV1,
  ProductRemoved as ProductRemovedEvent,
  ProductPaid as ProductPaidEventV1,
  ReleasedToSlicer as ReleasedToSlicerEvent,
  ERC721ListingChanged as ERC721ListingChangedEvent,
  ERC1155ListingChanged as ERC1155ListingChangedEvent
} from "../../generated/ProductsModuleV1/ProductsModule"
import {
  ProductAdded as ProductAddedEventV2,
  StoreClosed as StoreClosedEvent,
  ProductInfoChanged as ProductInfoChangedEventV2,
  ProductPaid as ProductPaidEventV2,
  ProductExternalCallUpdated
} from "../../generated/ProductsModuleV2/ProductsModule"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  updateSlicerStats,
  updateSlicerStatsTotalOrders
} from "../helpers/updateSlicerStats"
import { getUsdcAmount } from "../helpers/getUsdcAmount"

export function handleProductAddedV1(event: ProductAddedEventV1): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let categoryIndex = event.params.categoryIndex
  let isFree = event.params.isFree
  let maxUnitsPerBuyer = event.params.maxUnitsPerBuyer
  let isInfinite = event.params.isInfinite
  let availableUnits = event.params.availableUnits
  let creator = event.params.creator
  let data = event.params.data
  let subSlicerProducts = event.params.subSlicerProducts
  let currencyPrices = event.params.currencyPrices
  let externalCall = event.params.externalCall
  let address0 = new Bytes(20)
  let slicerProductId = slicerId + "-" + productId
  let subProducts: string[] = []

  let product = new Product(slicerProductId)

  product.slicer = slicerId
  product.categoryIndex = categoryIndex
  product.isRemoved = false
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.extRelativePrice = false
  product.extPreferredToken = false
  product.availableUnits = availableUnits
  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.creator = creator
  product.data = data
  product.createdAtTimestamp = event.block.timestamp
  product.totalPurchases = BigInt.fromI32(0)
  product.referralFeeProduct = BigInt.fromI32(0)

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
    productPrice.externalAddress = address0
    productPrice.save()
  }

  product.save()
}

export function handleProductAddedV2(event: ProductAddedEventV2): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let categoryIndex = event.params.categoryIndex
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
  let address0 = new Bytes(20)
  let slicerProductId = slicerId + "-" + productId
  let subProducts: string[] = []

  let product = new Product(slicerProductId)

  product.slicer = slicerId
  product.categoryIndex = categoryIndex
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
  product.referralFeeProduct = BigInt.fromI32(0)

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

export function handleProductInfoChangedV1(
  event: ProductInfoChangedEventV1
): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let maxUnitsPerBuyer = event.params.maxUnitsPerBuyer
  let isFree = event.params.isFree
  let isInfinite = event.params.isInfinite
  let availableUnits = event.params.newUnits
  let currencyPrices = event.params.currencyPrices
  let slicerProductId = slicerId + "-" + productId

  let product = Product.load(slicerProductId)!

  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.availableUnits = availableUnits

  for (let i = 0; i < currencyPrices.length; i++) {
    let currency = currencyPrices[i].currency.toHexString()
    let productPrice = ProductPrices.load(slicerProductId + "-" + currency)
    if (!productPrice) {
      productPrice = new ProductPrices(slicerProductId + "-" + currency)
      productPrice.product = slicerProductId
      productPrice.currency = currency
      productPrice.externalAddress = new Bytes(20)
    }
    productPrice.price = currencyPrices[i].value
    productPrice.dynamicPricing = currencyPrices[i].dynamicPricing
    productPrice.save()
  }

  product.save()
}

export function handleProductInfoChangedV2(
  event: ProductInfoChangedEventV2
): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let maxUnitsPerBuyer = event.params.maxUnitsPerBuyer
  let isFree = event.params.isFree
  let isInfinite = event.params.isInfinite
  let availableUnits = event.params.newUnits
  let currencyPrices = event.params.currencyPrices
  let slicerProductId = slicerId + "-" + productId

  let product = Product.load(slicerProductId)!

  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.availableUnits = availableUnits

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

export function handleProductRemoved(event: ProductRemovedEvent): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()

  let product = Product.load(slicerId + "-" + productId)!

  product.isRemoved = true
  product.categoryIndex = BigInt.fromI32(0)
  product.isFree = false
  product.isInfinite = false
  product.maxUnitsPerBuyer = BigInt.fromI32(0)
  product.availableUnits = BigInt.fromI32(0)
  product.data = new Bytes(0)
  product.extAddress = new Bytes(0)
  product.extValue = BigInt.fromI32(0)
  product.extCheckSig = new Bytes(0)
  product.extExecSig = new Bytes(0)
  product.extData = new Bytes(0)
  product.subProducts = []
  product.save()
}

export function handleProductPaidV1(event: ProductPaidEventV1): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let quantity = event.params.quantity
  let buyerAddress = event.params.buyer.toHexString()
  let currency = event.params.currency.toHexString()
  let paymentEth = event.params.paymentEth
  let paymentCurrency = event.params.paymentCurrency
  let address0 = new Bytes(20)
  let address0String = address0.toHexString()
  let slicerProductId = slicerId + "-" + productId

  let product = Product.load(slicerProductId)!
  let slicer = SlicerEntity.load(slicerId)!

  let paymentEthExternal = product.extValue.times(quantity)
  let totalPaymentEth = paymentEth.plus(paymentEthExternal)

  slicer.productsModuleBalance = slicer.productsModuleBalance.plus(paymentEth)
  slicer.save()

  product.totalPurchases = product.totalPurchases.plus(quantity)
  if (!product.isInfinite) {
    product.availableUnits = product.availableUnits.minus(quantity)
  }
  product.save()

  let payee = Payee.load(buyerAddress)
  if (!payee) {
    payee = new Payee(buyerAddress)
    payee.save()
  }

  let payeeSlicer = PayeeSlicer.load(buyerAddress + "-" + slicerId)
  if (!payeeSlicer) {
    payeeSlicer = new PayeeSlicer(buyerAddress + "-" + slicerId)
    payeeSlicer.payee = buyerAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = BigInt.fromI32(0)
    payeeSlicer.transfersAllowedWhileLocked = false
    payeeSlicer.save()
  }

  if (paymentCurrency != BigInt.fromI32(0)) {
    updateSlicerStats(
      slicerId,
      currency,
      paymentCurrency,
      quantity,
      event.block.timestamp
    )

    let payeeSlicerCurrency = PayeeSlicerCurrency.load(
      buyerAddress + "-" + slicerId + "-" + currency
    )
    if (!payeeSlicerCurrency) {
      payeeSlicerCurrency = new PayeeSlicerCurrency(
        buyerAddress + "-" + slicerId + "-" + currency
      )
      payeeSlicerCurrency.payeeSlicer = buyerAddress + "-" + slicerId
      payeeSlicerCurrency.payeeCurrency = buyerAddress + "-" + currency
      payeeSlicerCurrency.currencySlicer = currency + "-" + slicerId
      payeeSlicerCurrency.paidForProducts = BigInt.fromI32(0)
    }
    payeeSlicerCurrency.paidForProducts = payeeSlicerCurrency.paidForProducts.plus(
      paymentCurrency
    )
    payeeSlicerCurrency.save()
  }

  if (totalPaymentEth != BigInt.fromI32(0)) {
    updateSlicerStats(
      slicerId,
      address0.toHexString(),
      totalPaymentEth,
      // If there is a payment in currency, we don't want to count the quantity twice
      paymentCurrency != BigInt.fromI32(0) ? BigInt.fromI32(0) : quantity,
      event.block.timestamp
    )

    let payeeSlicerCurrency = PayeeSlicerCurrency.load(
      buyerAddress + "-" + slicerId + "-" + address0String
    )
    if (!payeeSlicerCurrency) {
      payeeSlicerCurrency = new PayeeSlicerCurrency(
        buyerAddress + "-" + slicerId + "-" + address0String
      )
      payeeSlicerCurrency.payeeSlicer = buyerAddress + "-" + slicerId
      payeeSlicerCurrency.payeeCurrency = buyerAddress + "-" + address0String
      payeeSlicerCurrency.currencySlicer = address0String + "-" + slicerId
      payeeSlicerCurrency.paidForProducts = BigInt.fromI32(0)
    }
    payeeSlicerCurrency.paidForProducts = payeeSlicerCurrency.paidForProducts.plus(
      totalPaymentEth
    )
    payeeSlicerCurrency.save()
  }

  let pp = ProductPurchase.load(slicerProductId + "-" + buyerAddress)
  if (!pp) {
    pp = new ProductPurchase(slicerProductId + "-" + buyerAddress)
    pp.product = slicerProductId
    pp.buyerSlicer = buyerAddress + "-" + slicerId
    pp.currencySlicer = currency + "-" + slicerId
    pp.buyer = buyerAddress
    pp.totalPaymentEth = BigInt.fromI32(0)
    pp.totalPaymentCurrency = BigInt.fromI32(0)
    pp.totalPaymentUsd = BigInt.fromI32(0)
    pp.totalPurchases = BigInt.fromI32(0)
    pp.totalQuantity = BigInt.fromI32(0)
  }
  pp.totalPaymentEth = pp.totalPaymentEth.plus(totalPaymentEth)
  pp.totalPaymentCurrency = pp.totalPaymentCurrency.plus(paymentCurrency)
  const paymentUsdFromEth = getUsdcAmount(currency, totalPaymentEth)
  const paymentUsdFromCurrency = getUsdcAmount(currency, paymentCurrency)
  const totalPaymentUsd = paymentUsdFromEth.plus(paymentUsdFromCurrency)
  pp.totalPaymentUsd = pp.totalPaymentUsd.plus(totalPaymentUsd)
  pp.lastPurchasedAtTimestamp = event.block.timestamp

  let totalPurchases = pp.totalPurchases.plus(BigInt.fromI32(1))
  pp.totalPurchases = totalPurchases

  let purchaseData = new PurchaseData(
    slicerProductId + "-" + buyerAddress + "-" + totalPurchases.toHex()
  )

  purchaseData.slicer = slicerId
  purchaseData.product = slicerProductId
  purchaseData.startPurchaseId = pp.totalQuantity
  purchaseData.productPurchase = slicerProductId + "-" + buyerAddress
  purchaseData.quantity = quantity
  purchaseData.timestamp = event.block.timestamp
  purchaseData.paymentEth = totalPaymentEth
  purchaseData.paymentCurrency = paymentCurrency
  purchaseData.referralEth = BigInt.fromI32(0)
  purchaseData.referralCurrency = BigInt.fromI32(0)

  pp.totalQuantity = pp.totalQuantity.plus(quantity)

  let order = Order.load(event.transaction.hash.toHexString())
  if (!order) {
    order = new Order(event.transaction.hash.toHexString())
    order.timestamp = event.block.timestamp
    order.payer = event.transaction.from.toHexString()
    order.buyer = buyerAddress
    order.referrer = address0String
    order.save()
  }

  let slicerOrder = SlicerOrder.load(
    slicerId + "-" + event.transaction.hash.toHexString()
  )
  if (!slicerOrder) {
    updateSlicerStatsTotalOrders(slicerId, event.block.timestamp)

    slicerOrder = new SlicerOrder(
      slicerId + "-" + event.transaction.hash.toHexString()
    )
    slicerOrder.slicer = slicerId
    slicerOrder.totalAmountUsd = totalPaymentUsd
    slicerOrder.order = event.transaction.hash.toHexString()
  } else {
    slicerOrder.totalAmountUsd = slicerOrder.totalAmountUsd.plus(
      totalPaymentUsd
    )
  }
  slicerOrder.save()

  purchaseData.save()
  pp.save()
}

export function handleProductPaidV2(event: ProductPaidEventV2): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let quantity = event.params.quantity
  let buyerAddress = event.params.buyer.toHexString()
  let currency = event.params.currency.toHexString()
  let price = event.params.price
  let paymentEth = price.eth
  let paymentCurrency = price.currency
  let extPaymentEth = price.ethExternalCall
  let extPaymentCurrency = price.currencyExternalCall
  let address0 = new Bytes(20)
  let address0String = address0.toHexString()
  let slicerProductId = slicerId + "-" + productId

  let product = Product.load(slicerProductId)!
  let slicer = SlicerEntity.load(slicerId)!

  let totalPaymentEth = paymentEth.plus(extPaymentEth)
  let totalPaymentCurrency = paymentCurrency.plus(extPaymentCurrency)

  // slicer.productsModuleBalance = slicer.productsModuleBalance.plus(paymentEth)
  // slicer.save()

  product.totalPurchases = product.totalPurchases.plus(quantity)
  if (!product.isInfinite) {
    product.availableUnits = product.availableUnits.minus(quantity)
  }
  product.save()

  let payee = Payee.load(buyerAddress)
  if (!payee) {
    payee = new Payee(buyerAddress)
    payee.save()
  }

  let payeeSlicer = PayeeSlicer.load(buyerAddress + "-" + slicerId)
  if (!payeeSlicer) {
    payeeSlicer = new PayeeSlicer(buyerAddress + "-" + slicerId)
    payeeSlicer.payee = buyerAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = BigInt.fromI32(0)
    payeeSlicer.transfersAllowedWhileLocked = false
    payeeSlicer.save()
  }

  if (totalPaymentCurrency != BigInt.fromI32(0)) {
    updateSlicerStats(
      slicerId,
      currency,
      totalPaymentCurrency,
      quantity,
      event.block.timestamp
    )

    let payeeSlicerCurrency = PayeeSlicerCurrency.load(
      buyerAddress + "-" + slicerId + "-" + currency
    )
    if (!payeeSlicerCurrency) {
      payeeSlicerCurrency = new PayeeSlicerCurrency(
        buyerAddress + "-" + slicerId + "-" + currency
      )

      let payeeCurrency = PayeeCurrency.load(buyerAddress + "-" + currency)
      if (!payeeCurrency) {
        payeeCurrency = new PayeeCurrency(buyerAddress + "-" + currency)
        payeeCurrency.payee = buyerAddress
        payeeCurrency.currency = currency
        payeeCurrency.toWithdraw = BigInt.fromI32(0)
        payeeCurrency.withdrawn = BigInt.fromI32(0)
        payeeCurrency.toPayToProtocol = BigInt.fromI32(0)
        payeeCurrency.paidToProtocol = BigInt.fromI32(0)
        payeeCurrency.totalReferralFees = BigInt.fromI32(0)
        payeeCurrency.totalCreatorFees = BigInt.fromI32(0)
        payeeCurrency.save()
      }

      payeeSlicerCurrency.payeeSlicer = buyerAddress + "-" + slicerId
      payeeSlicerCurrency.payeeCurrency = buyerAddress + "-" + currency
      payeeSlicerCurrency.currencySlicer = currency + "-" + slicerId
      payeeSlicerCurrency.paidForProducts = BigInt.fromI32(0)
    }
    payeeSlicerCurrency.paidForProducts = payeeSlicerCurrency.paidForProducts.plus(
      totalPaymentCurrency
    )
    payeeSlicerCurrency.save()
  }

  if (totalPaymentEth != BigInt.fromI32(0)) {
    updateSlicerStats(
      slicerId,
      address0.toHexString(),
      totalPaymentEth,
      // If there is a payment in currency, we don't want to count the quantity twice
      totalPaymentCurrency != BigInt.fromI32(0) ? BigInt.fromI32(0) : quantity,
      event.block.timestamp
    )

    let payeeSlicerCurrency = PayeeSlicerCurrency.load(
      buyerAddress + "-" + slicerId + "-" + address0String
    )
    if (!payeeSlicerCurrency) {
      payeeSlicerCurrency = new PayeeSlicerCurrency(
        buyerAddress + "-" + slicerId + "-" + address0String
      )

      let payeeCurrency = PayeeCurrency.load(
        buyerAddress + "-" + address0String
      )
      if (!payeeCurrency) {
        payeeCurrency = new PayeeCurrency(buyerAddress + "-" + address0String)
        payeeCurrency.payee = buyerAddress
        payeeCurrency.currency = address0String
        payeeCurrency.toWithdraw = BigInt.fromI32(0)
        payeeCurrency.withdrawn = BigInt.fromI32(0)
        payeeCurrency.toPayToProtocol = BigInt.fromI32(0)
        payeeCurrency.paidToProtocol = BigInt.fromI32(0)
        payeeCurrency.totalReferralFees = BigInt.fromI32(0)
        payeeCurrency.totalCreatorFees = BigInt.fromI32(0)
        payeeCurrency.save()
      }

      payeeSlicerCurrency.payeeSlicer = buyerAddress + "-" + slicerId
      payeeSlicerCurrency.payeeCurrency = buyerAddress + "-" + address0String
      payeeSlicerCurrency.currencySlicer = address0String + "-" + slicerId
      payeeSlicerCurrency.paidForProducts = BigInt.fromI32(0)
    }
    payeeSlicerCurrency.paidForProducts = payeeSlicerCurrency.paidForProducts.plus(
      totalPaymentEth
    )
    payeeSlicerCurrency.save()
  }

  let pp = ProductPurchase.load(slicerProductId + "-" + buyerAddress)
  if (!pp) {
    pp = new ProductPurchase(slicerProductId + "-" + buyerAddress)
    pp.product = slicerProductId
    pp.buyerSlicer = buyerAddress + "-" + slicerId
    pp.currencySlicer = currency + "-" + slicerId
    pp.buyer = buyerAddress
    pp.totalPaymentEth = BigInt.fromI32(0)
    pp.totalPaymentCurrency = BigInt.fromI32(0)
    pp.totalPaymentUsd = BigInt.fromI32(0)
    pp.totalPurchases = BigInt.fromI32(0)
    pp.totalQuantity = BigInt.fromI32(0)
    pp.totalQuantity = BigInt.fromI32(0)
  }
  pp.totalPaymentEth = pp.totalPaymentEth.plus(totalPaymentEth)
  pp.totalPaymentCurrency = pp.totalPaymentCurrency.plus(totalPaymentCurrency)
  const totalPaymentUsdFromEth = getUsdcAmount(currency, totalPaymentEth)
  const totalPaymentUsdFromCurrency = getUsdcAmount(
    currency,
    totalPaymentCurrency
  )
  const totalPaymentUsd = totalPaymentUsdFromEth.plus(
    totalPaymentUsdFromCurrency
  )
  pp.totalPaymentUsd = pp.totalPaymentUsd.plus(totalPaymentUsd)
  pp.lastPurchasedAtTimestamp = event.block.timestamp

  let totalPurchases = pp.totalPurchases.plus(BigInt.fromI32(1))
  pp.totalPurchases = totalPurchases

  let purchaseData = new PurchaseData(
    slicerProductId + "-" + buyerAddress + "-" + totalPurchases.toHex()
  )

  purchaseData.slicer = slicerId
  purchaseData.product = slicerProductId
  purchaseData.startPurchaseId = pp.totalQuantity
  purchaseData.productPurchase = slicerProductId + "-" + buyerAddress
  purchaseData.quantity = quantity
  purchaseData.timestamp = event.block.timestamp
  purchaseData.paymentEth = paymentEth
  purchaseData.paymentCurrency = paymentCurrency
  purchaseData.externalPaymentEth = extPaymentEth
  purchaseData.externalPaymentCurrency = extPaymentCurrency
  purchaseData.referralEth = BigInt.fromI32(0)
  purchaseData.referralCurrency = BigInt.fromI32(0)
  purchaseData.transactionHash = event.transaction.hash
  purchaseData.order = event.transaction.hash.toHexString()

  pp.totalQuantity = pp.totalQuantity.plus(quantity)

  let order = Order.load(event.transaction.hash.toHexString())
  if (!order) {
    order = new Order(event.transaction.hash.toHexString())
    order.timestamp = event.block.timestamp
    order.payer = event.transaction.from.toHexString()
    order.buyer = buyerAddress
    order.referrer = address0String
    order.save()
  }

  let slicerOrder = SlicerOrder.load(
    slicerId + "-" + event.transaction.hash.toHexString()
  )
  if (!slicerOrder) {
    updateSlicerStatsTotalOrders(slicerId, event.block.timestamp)

    slicerOrder = new SlicerOrder(
      slicerId + "-" + event.transaction.hash.toHexString()
    )
    slicerOrder.slicer = slicerId
    slicerOrder.totalAmountUsd = totalPaymentUsd
    slicerOrder.order = event.transaction.hash.toHexString()
  } else {
    slicerOrder.totalAmountUsd = slicerOrder.totalAmountUsd.plus(
      totalPaymentUsd
    )
  }
  slicerOrder.save()

  purchaseData.save()
  pp.save()
}

export function handleReleasedToSlicer(event: ReleasedToSlicerEvent): void {
  let slicerId = event.params.slicerId.toHex()
  let ethToRelease = event.params.ethToRelease

  let slicer = SlicerEntity.load(slicerId)!

  slicer.productsModuleBalance = BigInt.fromI32(1)
  slicer.productsModuleReleased = slicer.productsModuleReleased.plus(
    ethToRelease
  )
  slicer.save()
}

export function handleStoreClosed(event: StoreClosedEvent): void {
  let slicerId = event.params.slicerId.toHex()
  let StoreClosed = event.params.isStoreClosed

  let slicer = SlicerEntity.load(slicerId)!

  slicer.storeClosed = StoreClosed

  slicer.save()
}

export function handleProductExternalCallUpdated(
  event: ProductExternalCallUpdated
): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let extAddress = event.params.externalCall.externalAddress
  let extCheckSig = event.params.externalCall.checkFunctionSignature
  let extExecSig = event.params.externalCall.execFunctionSignature
  let extValue = event.params.externalCall.value
  let extData = event.params.externalCall.data
  let slicerProductId = slicerId + "-" + productId

  let product = Product.load(slicerProductId)!

  product.extAddress = extAddress
  product.extCheckSig = extCheckSig
  product.extExecSig = extExecSig
  product.extValue = extValue
  product.extData = extData

  product.save()
}

export function handleERC721ListingChanged(
  event: ERC721ListingChangedEvent
): void {
  let slicerId = event.params.slicerId.toHex()
  let contract = event.params.contractAddress
  let tokenId = event.params.tokenId
  let isActive = event.params.isActive
  let contractAddress = contract.toHexString()
  let tokenIdHex = tokenId.toHex()

  let tokenListing = TokenListing.load(
    slicerId + "-" + contractAddress + "-" + tokenIdHex
  )
  if (!tokenListing) {
    tokenListing = new TokenListing(
      slicerId + "-" + contractAddress + "-" + tokenIdHex
    )
    tokenListing.slicer = slicerId
    tokenListing.contract = contract
    tokenListing.tokenId = tokenId
    tokenListing.isERC721 = true
  }
  if (isActive) {
    tokenListing.quantity = BigInt.fromI32(1)
  } else {
    tokenListing.quantity = BigInt.fromI32(0)
  }
  tokenListing.lastEditedAtTimestamp = event.block.timestamp

  tokenListing.save()
}

export function handleERC1155ListingChanged(
  event: ERC1155ListingChangedEvent
): void {
  let slicerId = event.params.slicerId.toHex()
  let contract = event.params.contractAddress
  let tokenId = event.params.tokenId
  let currentAmount = event.params.currentAmount
  let contractAddress = contract.toHexString()
  let tokenIdHex = tokenId.toHex()

  let tokenListing = TokenListing.load(
    slicerId + "-" + contractAddress + "-" + tokenIdHex
  )
  if (!tokenListing) {
    tokenListing = new TokenListing(
      slicerId + "-" + contractAddress + "-" + tokenIdHex
    )
    tokenListing.slicer = slicerId
    tokenListing.contract = contract
    tokenListing.tokenId = tokenId
    tokenListing.isERC721 = false
  }
  tokenListing.quantity = currentAmount
  tokenListing.lastEditedAtTimestamp = event.block.timestamp

  tokenListing.save()
}
