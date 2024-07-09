import {
  Slicer as SlicerEntity,
  Payee,
  Currency,
  PayeeSlicer,
  CurrencySlicer,
  ReleaseEvent,
  PayeeCurrency
  // TokenReceived
} from "../../generated/schema"
import {
  Released as ReleasedEvent,
  Released1 as ReleasedEventV2,
  CurrenciesAdded as CurrenciesAddedEvent,
  ChildSlicerSet as ChildSlicerSetEvent,
  CustomFeeSet as CustomFeeSetEvent
  // ERC721Received as ERC721ReceivedEvent,
  // ERC1155Received as ERC1155ReceivedEvent,
  // ERC1155BatchReceived as ERC1155BatchReceivedEvent
} from "../../generated/templates/Slicer/Slicer"
import { BigInt, dataSource } from "@graphprotocol/graph-ts"
import { baseFee } from "./sliceCore"

export function handleReleased(event: ReleasedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let payee = event.params.payee.toHexString()
  let currency = event.params.currency.toHexString()
  let amountReleased = event.params.amountReleased
  let protocolPayment = event.params.protocolPayment

  let currencySlicer = CurrencySlicer.load(currency + "-" + slicerId)
  if (!currencySlicer) {
    currencySlicer = new CurrencySlicer(currency + "-" + slicerId)
    currencySlicer.currency = currency
    currencySlicer.slicer = slicerId
    currencySlicer.released = amountReleased
    currencySlicer.releasedToProtocol = protocolPayment
    currencySlicer.creatorFeePaid = BigInt.fromI32(0)
  } else {
    currencySlicer.released = currencySlicer.released.plus(amountReleased)
    currencySlicer.releasedToProtocol = currencySlicer.releasedToProtocol.plus(
      protocolPayment
    )
  }

  currencySlicer.save()

  let releaseEvent = new ReleaseEvent(
    slicerId +
      "-" +
      currency +
      "-" +
      payee +
      "-" +
      event.block.timestamp.toString()
  )

  releaseEvent.slicer = slicerId
  releaseEvent.currency = currency
  releaseEvent.payee = payee
  releaseEvent.currencySlicer = currency + "-" + slicerId
  releaseEvent.amountReleased = amountReleased
  releaseEvent.timestamp = event.block.timestamp

  releaseEvent.save()
}

export function handleReleasedV2(event: ReleasedEventV2): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let payee = event.params.payee.toHexString()
  let currency = event.params.currency.toHexString()
  let amountReleased = event.params.amountReleased
  let protocolPayment = event.params.protocolPayment
  let creatorPayment = event.params.creatorPayment

  let currencySlicer = CurrencySlicer.load(currency + "-" + slicerId)
  if (!currencySlicer) {
    currencySlicer = new CurrencySlicer(currency + "-" + slicerId)
    currencySlicer.currency = currency
    currencySlicer.slicer = slicerId
    currencySlicer.released = amountReleased
    currencySlicer.releasedToProtocol = protocolPayment
    currencySlicer.creatorFeePaid = creatorPayment
  } else {
    currencySlicer.released = currencySlicer.released.plus(amountReleased)
    currencySlicer.releasedToProtocol = currencySlicer.releasedToProtocol.plus(
      protocolPayment
    )
    currencySlicer.creatorFeePaid = currencySlicer.creatorFeePaid.plus(
      creatorPayment
    )
  }
  currencySlicer.save()

  let releaseEvent = new ReleaseEvent(
    slicerId +
      "-" +
      currency +
      "-" +
      payee +
      "-" +
      event.block.timestamp.toString()
  )

  if (creatorPayment > BigInt.fromI32(0)) {
    let payeeEntity = Payee.load(payee)
    if (!payee) {
      payeeEntity = new Payee(payee)
      payeeEntity.save()
    }

    let payeeCurrency = PayeeCurrency.load(payee + "-" + currency)
    if (!payeeCurrency) {
      payeeCurrency = new PayeeCurrency(payee + "-" + currency)
      payeeCurrency.payee = payee
      payeeCurrency.currency = currency
      payeeCurrency.toWithdraw = BigInt.fromI32(0)
      payeeCurrency.toPayToProtocol = BigInt.fromI32(0)
      payeeCurrency.withdrawn = BigInt.fromI32(0)
      payeeCurrency.paidToProtocol = BigInt.fromI32(0)
      payeeCurrency.totalReferralFees = BigInt.fromI32(0)
      payeeCurrency.totalCreatorFees = creatorPayment
    } else {
      payeeCurrency.totalCreatorFees = payeeCurrency.totalCreatorFees.plus(
        creatorPayment
      )
    }
    payeeCurrency.save()
  }

  releaseEvent.slicer = slicerId
  releaseEvent.currency = currency
  releaseEvent.payee = payee
  releaseEvent.currencySlicer = currency + "-" + slicerId
  releaseEvent.amountReleased = amountReleased
  releaseEvent.timestamp = event.block.timestamp

  releaseEvent.save()
}

export function handleCurrenciesAdded(event: CurrenciesAddedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let currencies = event.params.currencies

  for (let i = 0; i < currencies.length; i++) {
    let currencyAddress = currencies[i].toHexString()

    let acceptsCurrency = CurrencySlicer.load(currencyAddress + "-" + slicerId)

    if (!acceptsCurrency) {
      let currency = Currency.load(currencyAddress)
      if (!currency) {
        currency = new Currency(currencyAddress)
        currency.save()
      }

      let currencySlicer = new CurrencySlicer(currencyAddress + "-" + slicerId)
      currencySlicer.currency = currencyAddress
      currencySlicer.slicer = slicerId
      currencySlicer.released = BigInt.fromI32(0)
      currencySlicer.releasedToProtocol = BigInt.fromI32(0)
      currencySlicer.creatorFeePaid = BigInt.fromI32(0)
      currencySlicer.save()
    }
  }
}

export function handleChildSlicerSet(event: ChildSlicerSetEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)!
  let childSlicerId = event.params.slicerId.toHex()
  let isAdded = event.params.addChildSlicerMode
  let childrenSlicers = slicer.childrenSlicers

  if (isAdded) {
    if (!childrenSlicers.includes(childSlicerId)) {
      childrenSlicers.push(childSlicerId)
      slicer.childrenSlicers = childrenSlicers
    }
  } else {
    let index = -1
    for (let i = 0; i < childrenSlicers.length; i++) {
      if (childrenSlicers[i] == childSlicerId) {
        index = i
      }
    }

    if (index != -1) {
      childrenSlicers.splice(index, 1)
      slicer.childrenSlicers = childrenSlicers
    }
  }
  slicer.save()
}

export function handleCustomFeeSet(event: CustomFeeSetEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let slicer = SlicerEntity.load(slicerId)!
  let customFeeActive = event.params.customFeeActive
  let customFee = event.params.customFee

  if (customFeeActive) {
    slicer.protocolFee = customFee
  } else {
    slicer.protocolFee = BigInt.fromI32(baseFee)
  }

  slicer.save()
}

// export function handleERC721Received(event: ERC721ReceivedEvent): void {
//   let context = dataSource.context()
//   let slicerId = context.getString("slicerId")
//   let contract = event.params.contractAddress.toHexString()
//   let tokenId = event.params.tokenId.toHex()

//   let tokenReceived = TokenReceived.load(
//     slicerId + "-" + contract + "-" + tokenId
//   )
//   if (!tokenReceived) {
//     tokenReceived = new TokenReceived(slicerId + "-" + contract + "-" + tokenId)
//     tokenReceived.slicer = slicerId
//     tokenReceived.contract = event.params.contractAddress
//     tokenReceived.tokenId = event.params.tokenId
//     tokenReceived.quantity = BigInt.fromI32(1)
//     tokenReceived.isERC721 = true
//   }
//   tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
//   tokenReceived.save()
// }

// export function handleERC1155Received(event: ERC1155ReceivedEvent): void {
//   let context = dataSource.context()
//   let slicerId = context.getString("slicerId")
//   let contract = event.params.contractAddress.toHexString()
//   let tokenId = event.params.tokenId.toHex()
//   let amount = event.params.amount

//   let tokenReceived = TokenReceived.load(
//     slicerId + "-" + contract + "-" + tokenId
//   )
//   if (!tokenReceived) {
//     tokenReceived = new TokenReceived(slicerId + "-" + contract + "-" + tokenId)
//     tokenReceived.slicer = slicerId
//     tokenReceived.contract = event.params.contractAddress
//     tokenReceived.tokenId = event.params.tokenId
//     tokenReceived.quantity = amount
//   } else {
//     tokenReceived.quantity = tokenReceived.quantity.plus(amount)
//   }
//   tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
//   tokenReceived.save()
// }

// export function handleERC1155BatchReceived(
//   event: ERC1155BatchReceivedEvent
// ): void {
//   let context = dataSource.context()
//   let slicerId = context.getString("slicerId")
//   let contract = event.params.contractAddress.toHexString()
//   let tokenIds = event.params.tokenIds
//   let amounts = event.params.amounts

//   for (let i = 0; i < tokenIds.length; i++) {
//     let tokenId = tokenIds[i].toHex()
//     let amount = amounts[i]

//     let tokenReceived = TokenReceived.load(
//       slicerId + "-" + contract + "-" + tokenId
//     )
//     if (!tokenReceived) {
//       tokenReceived = new TokenReceived(
//         slicerId + "-" + contract + "-" + tokenId
//       )
//       tokenReceived.slicer = slicerId
//       tokenReceived.contract = event.params.contractAddress
//       tokenReceived.tokenId = tokenIds[i]
//       tokenReceived.quantity = amount
//     } else {
//       tokenReceived.quantity = tokenReceived.quantity.plus(amount)
//     }
//     tokenReceived.lastReceivedAtTimestamp = event.block.timestamp
//     tokenReceived.save()
//   }
// }
