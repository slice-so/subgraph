import {
  Slicer as SlicerEntity,
  Payee,
  Currency,
  PayeeSlicer,
  CurrencySlicer
  // TokenReceived
} from "../../generated/schema"
import {
  Released as ReleasedEvent,
  CurrenciesAdded as CurrenciesAddedEvent,
  ChildSlicerSet as ChildSlicerSetEvent,
  CustomFeeSet as CustomFeeSetEvent
  // ERC721Received as ERC721ReceivedEvent,
  // ERC1155Received as ERC1155ReceivedEvent,
  // ERC1155BatchReceived as ERC1155BatchReceivedEvent
} from "../../generated/templates/Slicer/Slicer"
import { BigInt, dataSource } from "@graphprotocol/graph-ts"

export function handleReleased(event: ReleasedEvent): void {
  let context = dataSource.context()
  let slicerId = context.getString("slicerId")
  let payee = event.params.payee
  let currency = event.params.currency.toHexString()
  let amountReleased = event.params.amountReleased
  let protocolPayment = event.params.protocolPayment

  let currencySlicer = CurrencySlicer.load(currency + "-" + slicerId)
  if (!currencySlicer) {
    currencySlicer = new CurrencySlicer(currency + "-" + slicerId)
    currencySlicer.save()
  }
  currencySlicer.released = currencySlicer.released.plus(amountReleased)
  currencySlicer.releasedToProtocol = currencySlicer.releasedToProtocol.plus(
    protocolPayment
  )

  currencySlicer.save()
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
    slicer.protocolFee = BigInt.fromI32(25)
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
