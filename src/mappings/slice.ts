import {
  Slicer as SlicerEntity,
  Payee,
  PayeeSlicer,
} from "../../generated/schema"
import {
  TokenSliced as TokenSlicedEvent,
  Upgraded as UpgradedEvent,
  ProductsPaid as ProductsPaidEvent,
} from "../../generated/Slice/Slice"
import { BigInt, DataSourceContext } from "@graphprotocol/graph-ts"
import { Slicer } from "../../generated/templates"

export function handleTokenSliced(event: TokenSlicedEvent): void {
  let totalSlices: BigInt
  let slicerId = event.params.tokenId.toString()
  let slicer = new SlicerEntity(slicerId)

  let payees = event.params.payees
  let shares = event.params.shares
  let sharesLength = shares.length

  slicer.address = event.params.slicerAddress
  slicer.minimumSlices = event.params.minimumShares
  slicer.isCollectible = event.params.isCollectible
  slicer.totalReceived = BigInt.fromI32(0)
  slicer.creator = event.transaction.from.toHexString()
  slicer.createdAtTimestamp = event.block.timestamp

  for (let i = 0; i < sharesLength; i++) {
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
      payee.save()
    }

    totalSlices = totalSlices.plus(share)
  }
  slicer.slices = totalSlices
  slicer.save()

  let context = new DataSourceContext()
  context.setString("slicerId", slicerId)
  Slicer.createWithContext(event.params.slicerAddress, context)
}

// export function handleProductsPaid(event: ProductsPaidEvent): void {}

// export function handleUpgraded(event: UpgradedEvent): void {}
