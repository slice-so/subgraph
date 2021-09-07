import { Payee, PayeeSlicer } from "../../generated/schema"
import {
  TransferSingle as TransferSingleEvent,
  TransferBatch as TransferBatchEvent,
} from "../../generated/SliceCore/SliceCore"
import { Address, BigInt, Bytes } from "@graphprotocol/graph-ts"

export function handleTransferSingle(event: TransferSingleEvent): void {
  let fromAddress = event.params.from.toHexString()
  let address0 = new Bytes(20) as Address
  if (fromAddress != address0.toHexString()) {
    let toAddress = event.params.to.toHexString()
    let slicerId = event.params.id.toString()
    let value = event.params.value

    let to = Payee.load(toAddress)
    let fromSlicer = PayeeSlicer.load(slicerId + "-" + fromAddress)
    let toSlicer = PayeeSlicer.load(slicerId + "-" + toAddress)
    if (!to) {
      to = new Payee(toAddress)
      to.save()
    }
    if (!toSlicer) {
      toSlicer = new PayeeSlicer(slicerId + "-" + toAddress)
      toSlicer.payee = toAddress
      toSlicer.slicer = slicerId
      toSlicer.slices = BigInt.fromI32(0)
    }
    toSlicer.slices = toSlicer.slices.plus(value)
    fromSlicer.slices = fromSlicer.slices.minus(value)
    fromSlicer.save()
    toSlicer.save()
  }
}

export function handleTransferBatch(event: TransferBatchEvent): void {
  let fromAddress = event.params.from.toHexString()
  let address0 = new Bytes(20) as Address
  if (fromAddress != address0.toHexString()) {
    let toAddress = event.params.to.toHexString()
    let to = Payee.load(toAddress)
    if (!to) {
      to = new Payee(toAddress)
      to.save()
    }
    let ids = event.params.ids
    let values = event.params.values
    for (let i = 0; i < ids.length; i++) {
      let slicerId = ids[i].toString()
      let value = values[i]

      let fromSlicer = PayeeSlicer.load(slicerId + "-" + fromAddress)
      let toSlicer = PayeeSlicer.load(slicerId + "-" + toAddress)
      if (!toSlicer) {
        toSlicer = new PayeeSlicer(slicerId + "-" + toAddress)
        toSlicer.payee = toAddress
        toSlicer.slicer = slicerId
        toSlicer.slices = BigInt.fromI32(0)
      }
      toSlicer.slices = toSlicer.slices.plus(value)
      fromSlicer.slices = fromSlicer.slices.minus(value)
      fromSlicer.save()
      toSlicer.save()
    }
  }
}
