import { Payee } from "../../generated/schema"
import {
  MintedSLC as MintedSLCEvent,
  MintTriggered as MintTriggeredEvent,
  Transfer as TransferEvent,
} from "../../generated/SLC/SLC"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleMintedSLC(event: MintedSLCEvent): void {
  let payee = Payee.load(event.params.receiver.toHexString())
  if (!payee) {
    payee = new Payee(event.params.receiver.toHexString())
  }
  payee.slc = payee.slc.plus(event.params.amount)
  payee.save()
}

export function handleMintTriggered(event: MintTriggeredEvent): void {
  let payee = Payee.load(event.params.receiver.toHexString())
  let slicerAmount = event.params.amount
    .times(BigInt.fromI32(event.params.slicerPercentage))
    .div(BigInt.fromI32(100))
  let payeeAmount = event.params.amount.minus(slicerAmount)

  if (!payee) {
    payee = new Payee(event.params.receiver.toHexString())
  }
  payee.slc = payee.slc.plus(payeeAmount)

  if (slicerAmount) {
    let slicerPayee = Payee.load(event.params.slicerAddress.toHexString())
    if (!slicerPayee) {
      slicerPayee = new Payee(event.params.slicerAddress.toHexString())
    }
    slicerPayee.slc = slicerPayee.slc.plus(payeeAmount)
    slicerPayee.save()
  }
  payee.save()
}

export function handleTransfer(event: TransferEvent): void {
  let from = Payee.load(event.params.from.toHexString())
  let to = Payee.load(event.params.to.toHexString())
  if (!to) {
    to = new Payee(event.params.to.toHexString())
  }
  from.slc = from.slc.minus(event.params.value)
  to.slc = to.slc.plus(event.params.value)
  from.save()
  to.save()
}
