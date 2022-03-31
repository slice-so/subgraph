import {
  Slicer as SlicerEntity,
  Payee,
  PayeeSlicer,
  CurrencySlicer,
  Currency
} from "../../generated/schema"
import {
  TokenSliced as TokenSlicedEvent,
  TokenResliced as TokenReslicedEvent,
  SlicerControllerSet as SlicerControllerSetEvent,
  RoyaltySet as RoyaltySetEvent,
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent
} from "../../generated/SliceCore/SliceCore"
import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  DataSourceContext
} from "@graphprotocol/graph-ts"
import { Slicer } from "../../generated/templates"

export function handleTokenSliced(event: TokenSlicedEvent): void {
  let slicerAddress = event.params.slicerAddress
  let slicerId = event.params.tokenId.toHex()
  let payees = event.params.payees
  let minimumShares = event.params.minimumShares
  let releaseTimelock = event.params.releaseTimelock
  let transferableTimelock = event.params.transferableTimelock
  let isImmutable = event.params.isImmutable
  let isControlled = event.params.isControlled
  let slicerVersion = event.params.slicerVersion
  let creator = event.transaction.from.toHexString()
  let totalSlices = BigInt.fromI32(0)
  let address0 = Address.fromBytes(new Bytes(20))

  let network = dataSource.network()
  let slxAddress: Address
  if (network == "rinkeby") {
    slxAddress = Address.fromString(
      "0x4F6Ff17F5dCb4f413C5f1b7eC42D6c18666452B0"
    )
  } else {
    slxAddress = Address.fromString(
      "0x6fa5FF63B2752265c6Bd9350591f97A7dAd9e918"
    )
  }

  let currencies = event.params.currencies
  currencies.push(slxAddress)
  currencies.push(address0)

  let slicer = new SlicerEntity(slicerId)

  slicer.slicerVersion = slicerVersion
  slicer.address = slicerAddress
  slicer.minimumSlices = minimumShares
  slicer.createdAtTimestamp = event.block.timestamp
  slicer.releaseTimelock = releaseTimelock
  slicer.transferableTimelock = transferableTimelock
  slicer.isImmutable = isImmutable
  slicer.creator = creator
  slicer.protocolFee = BigInt.fromI32(25)
  slicer.royaltyPercentage = BigInt.fromI32(50)
  slicer.royaltyReceiver = creator

  if (isControlled) {
    slicer.controller = creator
  }

  for (let i = 0; i < currencies.length; i++) {
    let currencyAddress = currencies[i].toHexString()

    let currency = Currency.load(currencyAddress)
    if (!currency) {
      currency = new Currency(currencyAddress)
      currency.save()
    }

    let currencySlicer = new CurrencySlicer(currencyAddress + "-" + slicerId)
    currencySlicer.currency = currencyAddress
    currencySlicer.slicer = slicerId
    currencySlicer.save()
  }

  for (let i = 0; i < payees.length; i++) {
    let payeeAddress = payees[i].account.toHexString()
    let share = payees[i].shares

    let payee = Payee.load(payeeAddress)
    if (!payee) {
      payee = new Payee(payeeAddress)
      payee.save()
    }

    let payeeSlicer = new PayeeSlicer(payeeAddress + "-" + slicerId)
    payeeSlicer.payee = payeeAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = share
    payeeSlicer.save()

    totalSlices = totalSlices.plus(share)
  }

  let creatorPayee = Payee.load(creator)
  if (!creatorPayee) {
    creatorPayee = new Payee(creator)
    creatorPayee.save()
  }

  slicer.slices = totalSlices
  slicer.save()

  let context = new DataSourceContext()
  context.setString("slicerId", slicerId)
  Slicer.createWithContext(slicerAddress, context)
}

export function handleTokenResliced(event: TokenReslicedEvent): void {
  let slicerId = event.params.tokenId.toHex()
  let accounts = event.params.accounts
  let tokensDiffs = event.params.tokensDiffs
  let slicer = SlicerEntity.load(slicerId)!
  let totalSlices = slicer.slices

  for (let i = 0; i < accounts.length; i++) {
    let account = accounts[i].toHexString()
    let tokenDiff = BigInt.fromI32(tokensDiffs[i])

    let payee = Payee.load(account)
    if (!payee) {
      payee = new Payee(account)
      payee.save()
    }

    let payeeSlicer = PayeeSlicer.load(account + "-" + slicerId)
    if (!payeeSlicer) {
      payeeSlicer = new PayeeSlicer(account + "-" + slicerId)
      payeeSlicer.payee = account
      payeeSlicer.slicer = slicerId
    }
    payeeSlicer.slices = payeeSlicer.slices.plus(tokenDiff)
    payeeSlicer.save()

    totalSlices = totalSlices.plus(tokenDiff)
  }

  // TODO: Check operations with int work as expected

  slicer.slices = totalSlices
  slicer.save()
}

export function handleSlicerControllerSet(
  event: SlicerControllerSetEvent
): void {
  let slicerId = event.params.tokenId.toHex()
  let slicerController = event.params.slicerController
  let controller = slicerController.toHexString()
  let slicer = SlicerEntity.load(slicerId)!

  let payee = Payee.load(controller)
  if (!payee) {
    payee = new Payee(controller)
    payee.save()
  }

  slicer.controller = controller
  slicer.save()
}

export function handleRoyaltySet(event: RoyaltySetEvent): void {
  let slicerId = event.params.tokenId.toHex()
  let isSlicer = event.params.isSlicer
  let isActive = event.params.isActive
  let royaltyPercentage = event.params.royaltyPercentage
  let slicer = SlicerEntity.load(slicerId)!

  if (isActive) {
    slicer.royaltyPercentage = royaltyPercentage
  } else {
    slicer.royaltyPercentage = BigInt.fromI32(50)
  }

  if (isSlicer) {
    let slicerAddress = slicer.address.toHexString()
    let payee = Payee.load(slicerAddress)
    if (!payee) {
      payee = new Payee(slicerAddress)
      payee.save()
    }

    slicer.royaltyReceiver = slicer.address.toHexString()
  } else {
    if (slicer.controller != "") {
      // TODO: Check condition is correct
      slicer.royaltyReceiver = slicer.controller
    } else {
      slicer.royaltyReceiver = slicer.creator
    }
  }

  slicer.save()
}

export function handleTransferSingle(event: TransferSingleEvent): void {
  let from = event.params.from.toHexString()
  let to = event.params.to.toHexString()
  let slicerId = event.params.id.toHex()
  let value = event.params.value
  let address0 = new Bytes(20)

  if (from != address0.toHexString() && from != to) {
    let toPayee = Payee.load(to)
    let fromSlicer = PayeeSlicer.load(from + "-" + slicerId)!
    let toSlicer = PayeeSlicer.load(to + "-" + slicerId)
    if (!toPayee) {
      toPayee = new Payee(to)
      toPayee.save()
    }
    if (!toSlicer) {
      toSlicer = new PayeeSlicer(to + "-" + slicerId)
      toSlicer.payee = to
      toSlicer.slicer = slicerId
      // toSlicer.slices = BigInt.fromI32(0)
    }
    toSlicer.slices = toSlicer.slices.plus(value)
    fromSlicer.slices = fromSlicer.slices.minus(value)
    fromSlicer.save()
    toSlicer.save()
  }
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let from = event.params.from.toHexString()
  let to = event.params.to.toHexString()
  let ids = event.params.ids
  let values = event.params.values
  let address0 = new Bytes(20)
  if (from != address0.toHexString() && from != to) {
    let toPayee = Payee.load(to)
    if (!toPayee) {
      toPayee = new Payee(to)
      toPayee.save()
    }
    for (let i = 0; i < ids.length; i++) {
      let slicerId = ids[i].toHex()
      let value = values[i]

      let fromSlicer = PayeeSlicer.load(from + "-" + slicerId)!
      let toSlicer = PayeeSlicer.load(to + "-" + slicerId)
      if (!toSlicer) {
        toSlicer = new PayeeSlicer(to + "-" + slicerId)
        toSlicer.payee = to
        toSlicer.slicer = slicerId
        // toSlicer.slices = BigInt.fromI32(0)
      }
      toSlicer.slices = toSlicer.slices.plus(value)
      fromSlicer.slices = fromSlicer.slices.minus(value)
      fromSlicer.save()
      toSlicer.save()
    }
  }
}
