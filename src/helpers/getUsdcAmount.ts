import { AggregatorV3Interface } from "../../generated/ProductsModuleV3/AggregatorV3Interface"
import { BigInt, Bytes, Address } from "@graphprotocol/graph-ts"

let address0 = Address.fromBytes(new Bytes(20))
const usdcAddress = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913"
const eurcAddress = "0x60a3E35Cc302bFA44Cb288Bc5a4F316Fdb1adb42"

export function getUsdcAmount(currencyAddress: string, amount: BigInt): BigInt {
  if (amount.isZero()) {
    return BigInt.fromI32(0)
  } else if (currencyAddress.toLowerCase() === usdcAddress.toLowerCase()) {
    return amount
  } else if (
    currencyAddress === address0.toHexString() ||
    currencyAddress.toLowerCase() === eurcAddress.toLowerCase()
  ) {
    const priceFeedAddress = Address.fromString(
      currencyAddress === address0.toHexString()
        ? "0x71041dddad3595F9CEd3DcCFBe3D1F4b0a16Bb70"
        : "0xDAe398520e2B67cd3f27aeF9Cf14D93D927f8250"
    )

    // Create price feed interface
    let priceFeed = AggregatorV3Interface.bind(priceFeedAddress)

    // Get latest price (in USD with 8 decimals)
    let priceResult = priceFeed.try_latestRoundData()
    if (priceResult.reverted) {
      return BigInt.fromI32(0)
    }

    let price = priceResult.value.value1 // Get the answer (price)

    // Convert amount to USDC (6 decimals)
    // price is in USD with 8 decimals, we need to:
    // 1. Multiply amount by price
    // 2. Divide by 10^2 to convert from 8 decimals to 6 decimals (USDC)
    return amount.times(price).div(BigInt.fromI32(100))
  } else {
    // TODO: Implement price feed
    // const priceFeedAddress = Address.fromString("")
    return BigInt.fromI32(0)
  }
}
