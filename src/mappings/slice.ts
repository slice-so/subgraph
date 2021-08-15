import {
  ProductsPaid as ProductsPaidEvent,
  TokenSliced as TokenSlicedEvent,
} from "../../generated/Slice/Slice"
import {
  Slicer as SlicerEntity,
  Payee,
  PayeeSlicer,
} from "../../generated/schema"
import { BigInt, Bytes, DataSourceContext } from "@graphprotocol/graph-ts"
import { Slicer } from "../../generated/templates"

export function handleTokenSliced(event: TokenSlicedEvent): void {
  let totalSlices: BigInt
  let slicerId = event.params.tokenId.toString()
  let slicer = new SlicerEntity(slicerId)
  slicer.address = event.params.slicerAddress
  slicer.minimumSlices = event.params.minimumShares
  slicer.totalReceived = BigInt.fromI32(0)
  slicer.creator = event.transaction.from.toHexString()
  slicer.createdAtTimestamp = event.block.timestamp

  let payees = event.params.payees as Array<Bytes>
  let shares = event.params.shares
  for (let i = 0; i < payees.length; i++) {
    let payeeAddress = payees[i].toHexString()
    let share = shares[i]

    let ps = new PayeeSlicer(slicerId + "-" + payeeAddress)
    ps.payee = payeeAddress
    ps.slicer = slicerId
    ps.slices = share
    ps.save()

    let payee = Payee.load(payeeAddress)
    if (!payee) {
      payee = new Payee(payeeAddress)
      // payee.slc = BigInt.fromI32(0)
      payee.save()
    }

    totalSlices = totalSlices.plus(share)
  }
  slicer.slices = totalSlices
  slicer.save()

  let context = new DataSourceContext()
  context.setBigInt("slicerId", event.params.tokenId)
  Slicer.createWithContext(event.params.slicerAddress, context)
}

// export function handleProductsPaid(event: ProductsPaidEvent): void {
//   const buyerAddress = event.transaction.from.toHexString()

//   entity.slicerAddresses = event.params.slicerAddresses as Array<Bytes>
//   entity.productIds = event.params.productIds as Array<BigInt>
//   entity.quantities = event.params.quantities as Array<BigInt>
//   entity.totalPaid = event.params.totalPaid
//   entity.save()
// }
