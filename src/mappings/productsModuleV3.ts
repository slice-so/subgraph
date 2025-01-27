import {
  Slicer as SlicerEntity,
  Payee,
  Product,
  PayeeSlicer,
  ProductPurchase,
  ProductPrices,
  CurrencySlicer,
  ExtraCost,
  PayeeCurrency,
  PayeeSlicerCurrency,
  SlicerOrderTotalAmountCurrency,
  Order,
  PurchaseData,
  SlicerOrder,
  Slicer,
  SlicerAddress
} from "../../generated/schema"
import {
  ProductAdded as ProductAddedEvent,
  StoreConfigChanged as StoreConfigChangedEvent,
  ExtraCostPaid as ExtraCostPaidEvent,
  ProductInfoChanged as ProductInfoChangedEvent,
  ProductPaid as ProductPaidEvent,
  PurchaseMade as PurchaseMadeEvent
} from "../../generated/ProductsModuleV3/ProductsModule"
import { BigInt, Bytes } from "@graphprotocol/graph-ts"
import {
  updateSlicerStats,
  updateSlicerStatsQuantity,
  updateSlicerStatsTotalOrders
} from "../helpers/updateSlicerStats"
import { getUsdcAmount } from "../helpers/getUsdcAmount"

export function handleProductAddedV3(event: ProductAddedEvent): void {
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
  let referralFeeProduct = params.referralFeeProduct
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

export function handleProductInfoChangedV3(
  event: ProductInfoChangedEvent
): void {
  let slicerId = event.params.slicerId.toHex()
  let productId = event.params.productId.toHex()
  let maxUnitsPerBuyer = event.params.maxUnitsPerBuyer
  let isFree = event.params.isFree
  let isInfinite = event.params.isInfinite
  let availableUnits = event.params.newUnits
  let currencyPrices = event.params.currencyPrices
  let slicerProductId = slicerId + "-" + productId
  let referralFeeProduct = event.params.referralFeeProduct

  let product = Product.load(slicerProductId)!

  product.maxUnitsPerBuyer = BigInt.fromI32(maxUnitsPerBuyer)
  product.isFree = isFree
  product.isInfinite = isInfinite
  product.availableUnits = availableUnits
  product.referralFeeProduct = referralFeeProduct

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

export function handleProductPaidV3(event: ProductPaidEvent): void {
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
  let referrer = event.params.referrer

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

  updateSlicerStatsQuantity(slicerId, quantity, event.block.timestamp)

  if (totalPaymentCurrency != BigInt.fromI32(0)) {
    updateSlicerStats(
      slicerId,
      currency,
      totalPaymentCurrency,
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

  if (referrer != address0) {
    const referralFee =
      product.referralFeeProduct || slicer.referralFeeStore || BigInt.fromI32(0)

    const referralAmountEth = paymentEth
      .times(referralFee)
      .div(BigInt.fromI32(10000))
    purchaseData.referralEth = referralAmountEth

    const referralAmountCurrency = paymentCurrency
      .times(referralFee)
      .div(BigInt.fromI32(10000))
    purchaseData.referralCurrency = referralAmountCurrency

    const referralAmountUsdFromEth = getUsdcAmount(currency, referralAmountEth)
    const referralAmountUsdFromCurrency = getUsdcAmount(
      currency,
      referralAmountCurrency
    )
    const referralAmountUsd = referralAmountUsdFromEth.plus(
      referralAmountUsdFromCurrency
    )
    purchaseData.referralUsd = referralAmountUsd

    let referrerPayee = Payee.load(referrer.toHexString())
    if (!referrerPayee) {
      referrerPayee = new Payee(referrer.toHexString())
      referrerPayee.save()
    }

    let referrerCurrency = PayeeCurrency.load(
      referrer.toHexString() + "-" + currency
    )
    const referralAmount =
      currency === address0String
        ? purchaseData.referralEth
        : purchaseData.referralCurrency
    if (!referrerCurrency) {
      referrerCurrency = new PayeeCurrency(
        referrer.toHexString() + "-" + currency
      )
      referrerCurrency.payee = referrer.toHexString()
      referrerCurrency.currency = currency
      referrerCurrency.toWithdraw = BigInt.fromI32(0)
      referrerCurrency.toPayToProtocol = BigInt.fromI32(0)
      referrerCurrency.withdrawn = BigInt.fromI32(0)
      referrerCurrency.paidToProtocol = BigInt.fromI32(0)
      // TODO: Technically not correct but should work for now
      // In theory we should track referralFees for both currency and eth separately
      referrerCurrency.totalReferralFees = referralAmount
      referrerCurrency.totalCreatorFees = BigInt.fromI32(0)
    } else {
      referrerCurrency.totalReferralFees = referrerCurrency.totalReferralFees.plus(
        referralAmount
      )
    }
    referrerCurrency.save()
  } else {
    purchaseData.referralEth = BigInt.fromI32(0)
    purchaseData.referralCurrency = BigInt.fromI32(0)
    purchaseData.referralUsd = BigInt.fromI32(0)
  }

  purchaseData.slicer = slicerId
  purchaseData.product = slicerProductId
  purchaseData.startPurchaseId = pp.totalQuantity
  purchaseData.productPurchase = slicerProductId + "-" + buyerAddress
  purchaseData.quantity = quantity
  purchaseData.timestamp = event.block.timestamp
  purchaseData.paymentEth = paymentEth
  purchaseData.paymentCurrency = paymentCurrency
  const paymentUsdFromEth = getUsdcAmount(currency, paymentEth)
  const paymentUsdFromCurrency = getUsdcAmount(currency, paymentCurrency)
  const paymentUsd = paymentUsdFromEth.plus(paymentUsdFromCurrency)
  purchaseData.paymentUsd = paymentUsd
  purchaseData.externalPaymentEth = extPaymentEth
  purchaseData.externalPaymentCurrency = extPaymentCurrency
  const externalPaymentUsdFromEth = getUsdcAmount(currency, extPaymentEth)
  const externalPaymentUsdFromCurrency = getUsdcAmount(
    currency,
    extPaymentCurrency
  )
  const externalPaymentUsd = externalPaymentUsdFromEth.plus(
    externalPaymentUsdFromCurrency
  )
  purchaseData.externalPaymentUsd = externalPaymentUsd
  purchaseData.transactionHash = event.transaction.hash
  purchaseData.order = event.transaction.hash.toHexString()
  if (event.params.parentProductId != BigInt.fromI32(0)) {
    purchaseData.parentSlicer = event.params.parentSlicerId.toHex()

    purchaseData.parentProduct =
      event.params.parentSlicerId.toHex() +
      "-" +
      event.params.parentProductId.toHex()
  }

  pp.totalQuantity = pp.totalQuantity.plus(quantity)

  let order = Order.load(event.transaction.hash.toHexString())
  if (!order) {
    let payer = Payee.load(event.transaction.from.toHexString())
    if (!payer) {
      payer = new Payee(event.transaction.from.toHexString())
      payer.save()
    }

    if (referrer != address0) {
      let referrerPayee = Payee.load(referrer.toHexString())
      if (!referrerPayee) {
        referrerPayee = new Payee(referrer.toHexString())
        referrerPayee.save()
      }
    }

    order = new Order(event.transaction.hash.toHexString())
    order.timestamp = event.block.timestamp
    order.payer = event.transaction.from.toHexString() // TODO: Fix, this should be msg.sender not tx.origin
    order.buyer = buyerAddress
    order.referrer = referrer.toHexString()
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
    slicerOrder.timestamp = event.block.timestamp
    slicerOrder.totalAmountUsd = totalPaymentUsd
    slicerOrder.order = event.transaction.hash.toHexString()
  } else {
    slicerOrder.totalAmountUsd = slicerOrder.totalAmountUsd.plus(
      totalPaymentUsd
    )
  }

  if (totalPaymentEth != BigInt.fromI32(0)) {
    updateSlicerOrderTotalAmountCurrency(
      slicerOrder,
      address0.toHexString(),
      totalPaymentEth
    )
  }

  if (totalPaymentCurrency != BigInt.fromI32(0)) {
    updateSlicerOrderTotalAmountCurrency(
      slicerOrder,
      currency,
      totalPaymentCurrency
    )
  }

  slicerOrder.save()

  purchaseData.save()
  pp.save()
}

export function handleExtraCostPaid(event: ExtraCostPaidEvent): void {
  const address0 = new Bytes(20)
  const txHash = event.transaction.hash.toHexString()
  let currency = event.params.currency.toHex()
  let amount = event.params.amount
  let amountUsd = getUsdcAmount(currency, amount)
  let description = event.params.description
  let recipient = event.params.recipient

  const extraCostId =
    txHash + "-" + currency + "-" + recipient.toHex() + "-" + description

  let extraCost = ExtraCost.load(extraCostId)

  if (!extraCost) {
    extraCost = new ExtraCost(extraCostId)
    extraCost.order = txHash
    extraCost.recipient = recipient
    extraCost.currency = currency
    extraCost.amount = amount
    extraCost.amountUsd = amountUsd
    extraCost.description = description
  } else {
    extraCost.amount = extraCost.amount.plus(amount)
    extraCost.amountUsd = extraCost.amountUsd.plus(amountUsd)
  }

  let order = Order.load(event.transaction.hash.toHexString())
  if (!order) {
    let payer = Payee.load(event.transaction.from.toHexString())
    if (!payer) {
      payer = new Payee(event.transaction.from.toHexString())
      payer.save()
    }

    order = new Order(event.transaction.hash.toHexString())
    order.timestamp = event.block.timestamp
    order.payer = event.transaction.from.toHexString() // TODO: Fix, this should be msg.sender not tx.origin
    order.buyer = address0.toHexString()
    order.referrer = address0.toHexString()
    order.save()
  }

  let slicer = SlicerAddress.load(recipient.toHexString())

  if (slicer) {
    let slicerId = slicer.slicer
    let slicerOrder = SlicerOrder.load(
      slicerId + "-" + event.transaction.hash.toHexString()
    )

    if (!slicerOrder) {
      updateSlicerStatsTotalOrders(slicerId, event.block.timestamp)

      slicerOrder = new SlicerOrder(
        slicerId + "-" + event.transaction.hash.toHexString()
      )
      slicerOrder.slicer = slicerId
      slicerOrder.timestamp = event.block.timestamp
      slicerOrder.totalAmountUsd = amountUsd
      slicerOrder.order = event.transaction.hash.toHexString()
    } else {
      slicerOrder.totalAmountUsd = slicerOrder.totalAmountUsd.plus(amountUsd)
    }

    if (amount != BigInt.fromI32(0)) {
      updateSlicerOrderTotalAmountCurrency(slicerOrder, currency, amount)
    }

    slicerOrder.save()
  }
  extraCost.save()
}

export function updateSlicerOrderTotalAmountCurrency(
  slicerOrder: SlicerOrder,
  currency: string,
  amount: BigInt
): void {
  let totalAmountCurrency = SlicerOrderTotalAmountCurrency.load(
    slicerOrder.id + "-" + currency
  )

  if (!totalAmountCurrency) {
    totalAmountCurrency = new SlicerOrderTotalAmountCurrency(
      slicerOrder.id + "-" + currency
    )
    totalAmountCurrency.slicerOrder = slicerOrder.id
    totalAmountCurrency.currency = currency
    totalAmountCurrency.totalAmount = amount
  } else {
    totalAmountCurrency.totalAmount = totalAmountCurrency.totalAmount.plus(
      amount
    )
  }

  totalAmountCurrency.save()
}

export function handleStoreConfigChanged(event: StoreConfigChangedEvent): void {
  let slicerId = event.params.slicerId.toHex()
  let StoreClosed = event.params.isStoreClosed
  let referralFeeStore = event.params.referralFeeStore

  let slicer = SlicerEntity.load(slicerId)!

  slicer.storeClosed = StoreClosed
  slicer.referralFeeStore = referralFeeStore

  slicer.save()
}

export function handlePurchaseMade(event: PurchaseMadeEvent): void {
  let address0 = new Bytes(20)

  let order = Order.load(event.transaction.hash.toHexString())

  // If the order has no buyer (ie open order), set the buyer using the PurchaseMade event
  if (!!order && order.buyer == address0.toHexString()) {
    let buyer = Payee.load(event.params.buyer.toHexString())
    if (!buyer) {
      buyer = new Payee(event.params.buyer.toHexString())
      buyer.save()
    }
    order.buyer = buyer.id
    order.save()
  }
}
