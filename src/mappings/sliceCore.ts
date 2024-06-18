import {
  Slicer as SlicerEntity,
  Payee,
  PayeeSlicer,
  CurrencySlicer,
  Currency
} from "../../generated/schema"
import {
  TokenSliced as TokenSlicedEventV1,
  TokenResliced as TokenReslicedEvent,
  SlicerControllerSet as SlicerControllerSetEvent,
  RoyaltySet as RoyaltySetEvent,
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent
} from "../../generated/SliceCoreV1/SliceCore"
import { TokenSliced as TokenSlicedEventV2 } from "../../generated/SliceCoreV2/SliceCore"
import {
  Address,
  BigInt,
  Bytes,
  dataSource,
  DataSourceContext
} from "@graphprotocol/graph-ts"
import { Slicer } from "../../generated/templates"

export function handleTokenSlicedV1(event: TokenSlicedEventV1): void {
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
  slicer.protocolFee = BigInt.fromI32(0)
  slicer.royaltyPercentage = BigInt.fromI32(50)
  slicer.royaltyReceiver = creator
  slicer.productsModuleBalance = BigInt.fromI32(0)
  slicer.productsModuleReleased = BigInt.fromI32(0)
  slicer.currenciesControlled = false
  slicer.productsControlled = false
  slicer.acceptsAllCurrencies = false
  slicer.resliceAllowed = false
  slicer.transferWhileControlledAllowed = false
  slicer.childrenSlicers = []
  slicer.storeClosed = false
  slicer.referralFeeStore = BigInt.fromI32(0)

  if (isControlled) {
    slicer.controller = creator
  } else {
    let zeroAddress = address0.toHexString()
    let address0Payee = Payee.load(zeroAddress)
    if (!address0Payee) {
      address0Payee = new Payee(zeroAddress)
      address0Payee.save()
    }
    slicer.controller = zeroAddress
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
    currencySlicer.released = BigInt.fromI32(0)
    currencySlicer.releasedToProtocol = BigInt.fromI32(0)
    currencySlicer.creatorFeePaid = BigInt.fromI32(0)
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

    let payeeSlicer = PayeeSlicer.load(payeeAddress + "-" + slicerId)
    if (!payeeSlicer) {
      payeeSlicer = new PayeeSlicer(payeeAddress + "-" + slicerId)
      payeeSlicer.slices = BigInt.fromI32(0)
    }

    payeeSlicer.payee = payeeAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = payeeSlicer.slices.plus(share)
    payeeSlicer.transfersAllowedWhileLocked = false

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

export function handleTokenSlicedV2(event: TokenSlicedEventV2): void {
  let slicerAddress = event.params.slicerAddress
  let slicerId = event.params.tokenId.toHex()
  let params = event.params.params
  let payees = params.payees
  let minimumShares = params.minimumShares
  let releaseTimelock = params.releaseTimelock
  let transferableTimelock = params.transferTimelock
  let controller = params.controller.toHexString()
  let slicerFlags = params.slicerFlags
  let sliceCoreFlags = params.sliceCoreFlags
  let slicerVersion = event.params.slicerVersion
  let creator = event.transaction.from.toHexString()
  let totalSlices = BigInt.fromI32(0)
  let address0 = Address.fromBytes(new Bytes(20))
  let zeroAddress = address0.toHexString()

  let royaltyReceiver = creator

  let network = dataSource.network()
  let slxAddress: Address
  if (network == "goerli") {
    slxAddress = Address.fromString(
      "0x1D3804fd06f09266153882bF391552BEFA2DBC05"
    )
  } else {
    slxAddress = Address.fromString(
      "0x6fa5FF63B2752265c6Bd9350591f97A7dAd9e918"
    )
  }

  let currencies = params.currencies
  currencies.push(slxAddress)
  currencies.push(address0)

  let slicer = new SlicerEntity(slicerId)

  slicer.slicerVersion = slicerVersion
  slicer.address = slicerAddress
  slicer.minimumSlices = minimumShares
  slicer.createdAtTimestamp = event.block.timestamp
  slicer.releaseTimelock = releaseTimelock
  slicer.transferableTimelock = transferableTimelock
  slicer.creator = creator
  slicer.protocolFee = BigInt.fromI32(0)
  slicer.productsModuleBalance = BigInt.fromI32(0)
  slicer.productsModuleReleased = BigInt.fromI32(0)
  slicer.controller = controller
  slicer.childrenSlicers = []
  slicer.storeClosed = false
  slicer.referralFeeStore = BigInt.fromI32(0)

  let controllerPayee = Payee.load(controller)
  if (!controllerPayee) {
    controllerPayee = new Payee(controller)
    controllerPayee.save()
  }

  // Boolean flags ordered right to left: [isImmutable, currenciesControlled, productsControlled, acceptsAllCurrencies]
  slicer.isImmutable = slicerFlags % 2 == 1
  slicer.currenciesControlled = (slicerFlags / 2) % 2 == 1
  slicer.productsControlled = (slicerFlags / 2 ** 2) % 2 == 1
  slicer.acceptsAllCurrencies = (slicerFlags / 2 ** 3) % 2 == 1

  // Boolean flags ordered right to left: [isCustomRoyaltyActive, isRoyaltyReceiverSlicer, resliceAllowed, transferWhileControlledAllowed]
  let royaltyPercentage =
    sliceCoreFlags % 2 == 1 ? BigInt.fromI32(0) : BigInt.fromI32(50)
  slicer.royaltyPercentage = royaltyPercentage

  if ((sliceCoreFlags / 2) % 2 == 1) {
    let payee = new Payee(slicerAddress.toHexString())
    payee.save()

    royaltyReceiver = slicerAddress.toHexString()
  } else if (controller != zeroAddress) {
    royaltyReceiver = controller
  }
  slicer.royaltyReceiver = royaltyReceiver

  slicer.resliceAllowed = (sliceCoreFlags / 2 ** 2) % 2 == 1
  slicer.transferWhileControlledAllowed = (sliceCoreFlags / 2 ** 3) % 2 == 1

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
    currencySlicer.released = BigInt.fromI32(0)
    currencySlicer.releasedToProtocol = BigInt.fromI32(0)
    currencySlicer.creatorFeePaid = BigInt.fromI32(0)
    currencySlicer.save()
  }

  for (let i = 0; i < payees.length; i++) {
    let payeeAddress = payees[i].account.toHexString()
    let share = payees[i].shares
    let transfersAllowedWhileLocked = payees[i].transfersAllowedWhileLocked

    let payee = Payee.load(payeeAddress)
    if (!payee) {
      payee = new Payee(payeeAddress)
      payee.save()
    }

    let payeeSlicer = PayeeSlicer.load(payeeAddress + "-" + slicerId)
    if (!payeeSlicer) {
      payeeSlicer = new PayeeSlicer(payeeAddress + "-" + slicerId)
      payeeSlicer.slices = BigInt.fromI32(0)
    }

    payeeSlicer.payee = payeeAddress
    payeeSlicer.slicer = slicerId
    payeeSlicer.slices = payeeSlicer.slices.plus(share)
    payeeSlicer.transfersAllowedWhileLocked = transfersAllowedWhileLocked
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
      payeeSlicer.slices = BigInt.fromI32(0)
      payeeSlicer.transfersAllowedWhileLocked = false
    }
    payeeSlicer.slices = payeeSlicer.slices.plus(tokenDiff)
    payeeSlicer.save()

    totalSlices = totalSlices.plus(tokenDiff)
  }

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
  if (slicer.royaltyReceiver != slicer.address.toHexString()) {
    slicer.royaltyReceiver = controller
  }
  slicer.save()
}

export function handleRoyaltySet(event: RoyaltySetEvent): void {
  let slicerId = event.params.tokenId.toHex()
  let isSlicer = event.params.isSlicer
  let isActive = event.params.isActive
  let royaltyPercentage = event.params.royaltyPercentage
  let slicer = SlicerEntity.load(slicerId)!
  let address0 = Address.fromBytes(new Bytes(20))

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
    if (slicer.controller != address0.toHexString()) {
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

  if (
    from != address0.toHexString() &&
    to != address0.toHexString() &&
    from != to
  ) {
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
      toSlicer.slices = BigInt.fromI32(0)
      toSlicer.transfersAllowedWhileLocked = false
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
  if (
    from != address0.toHexString() &&
    to != address0.toHexString() &&
    from != to
  ) {
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
        toSlicer.slices = BigInt.fromI32(0)
        toSlicer.transfersAllowedWhileLocked = false
      }
      toSlicer.slices = toSlicer.slices.plus(value)
      fromSlicer.slices = fromSlicer.slices.minus(value)
      fromSlicer.save()
      toSlicer.save()
    }
  }
}
