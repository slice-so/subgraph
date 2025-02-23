import {
  Slicer,
  CurrencySlicer,
  SlicerStatsByDay,
  SlicerStatsByWeek,
  SlicerStatsByMonth,
  SlicerStatsByYear,
  CurrencySlicerDay,
  CurrencySlicerWeek,
  CurrencySlicerMonth,
  CurrencySlicerYear
} from "../../generated/schema"
import { BigInt } from "@graphprotocol/graph-ts"
import { getUsdcAmount } from "./getUsdcAmount"

class Dates {
  currentDay: BigInt = BigInt.fromI32(0)
  currentWeek: BigInt = BigInt.fromI32(0)
  currentMonth: BigInt = BigInt.fromI32(0)
  currentYear: BigInt = BigInt.fromI32(0)

  static create(day: BigInt, week: BigInt, month: BigInt, year: BigInt): Dates {
    const dates = new Dates()
    dates.currentDay = day
    dates.currentWeek = week
    dates.currentMonth = month
    dates.currentYear = year
    return dates
  }
}

export function updateSlicerStatsQuantity(
  slicerId: string,
  quantity: BigInt,
  timestamp: BigInt
): void {
  const datesValues = getDates(timestamp)

  const currentYear = datesValues.currentYear
  const currentMonth = datesValues.currentMonth
  const currentWeek = datesValues.currentWeek
  const currentDay = datesValues.currentDay

  let slicer = Slicer.load(slicerId)!
  slicer.totalProductsPurchased = slicer.totalProductsPurchased.plus(quantity)
  slicer.save()

  let slicerStatsByYear = SlicerStatsByYear.load(
    slicerId + "-" + currentYear.toHex()
  )
  if (!slicerStatsByYear) {
    slicerStatsByYear = new SlicerStatsByYear(
      slicerId + "-" + currentYear.toHex()
    )
    slicerStatsByYear.slicer = slicerId
    slicerStatsByYear.year = currentYear
    slicerStatsByYear.totalOrders = BigInt.fromI32(0)
    slicerStatsByYear.totalProductsPurchased = quantity
    slicerStatsByYear.totalEarnedUsd = BigInt.fromI32(0)
  } else {
    slicerStatsByYear.totalProductsPurchased = slicerStatsByYear.totalProductsPurchased.plus(
      quantity
    )
  }
  slicerStatsByYear.save()

  let slicerStatsByMonth = SlicerStatsByMonth.load(
    slicerId + "-" + currentMonth.toHex()
  )
  if (!slicerStatsByMonth) {
    slicerStatsByMonth = new SlicerStatsByMonth(
      slicerId + "-" + currentMonth.toHex()
    )
    slicerStatsByMonth.slicer = slicerId
    slicerStatsByMonth.month = currentMonth
    slicerStatsByMonth.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByMonth.totalOrders = BigInt.fromI32(0)
    slicerStatsByMonth.totalProductsPurchased = quantity
    slicerStatsByMonth.totalEarnedUsd = BigInt.fromI32(0)
  } else {
    slicerStatsByMonth.totalProductsPurchased = slicerStatsByMonth.totalProductsPurchased.plus(
      quantity
    )
  }
  slicerStatsByMonth.save()

  let slicerStatsByWeek = SlicerStatsByWeek.load(
    slicerId + "-" + currentWeek.toHex()
  )
  if (!slicerStatsByWeek) {
    slicerStatsByWeek = new SlicerStatsByWeek(
      slicerId + "-" + currentWeek.toHex()
    )
    slicerStatsByWeek.slicer = slicerId
    slicerStatsByWeek.week = currentWeek
    slicerStatsByWeek.month = slicerId + "-" + currentMonth.toHex()
    slicerStatsByWeek.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByWeek.totalOrders = BigInt.fromI32(0)
    slicerStatsByWeek.totalProductsPurchased = quantity
    slicerStatsByWeek.totalEarnedUsd = BigInt.fromI32(0)
  } else {
    slicerStatsByWeek.totalProductsPurchased = slicerStatsByWeek.totalProductsPurchased.plus(
      quantity
    )
  }
  slicerStatsByWeek.save()

  let slicerStatsByDay = SlicerStatsByDay.load(
    slicerId + "-" + currentDay.toHex()
  )
  if (!slicerStatsByDay) {
    slicerStatsByDay = new SlicerStatsByDay(slicerId + "-" + currentDay.toHex())
    slicerStatsByDay.slicer = slicerId
    slicerStatsByDay.day = currentDay
    slicerStatsByDay.week = slicerId + "-" + currentWeek.toHex()
    slicerStatsByDay.month = slicerId + "-" + currentMonth.toHex()
    slicerStatsByDay.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByDay.totalOrders = BigInt.fromI32(0)
    slicerStatsByDay.totalProductsPurchased = quantity
    slicerStatsByDay.totalEarnedUsd = BigInt.fromI32(0)
  } else {
    slicerStatsByDay.totalProductsPurchased = slicerStatsByDay.totalProductsPurchased.plus(
      quantity
    )
  }
  slicerStatsByDay.save()
}

export function updateSlicerStats(
  slicerId: string,
  currency: string,
  totalPaymentAmount: BigInt,
  timestamp: BigInt
): void {
  const datesValues = getDates(timestamp)

  const currentYear = datesValues.currentYear
  const currentMonth = datesValues.currentMonth
  const currentWeek = datesValues.currentWeek
  const currentDay = datesValues.currentDay

  const usdcAmount = getUsdcAmount(currency, totalPaymentAmount)

  let slicer = Slicer.load(slicerId)!
  slicer.totalEarnedUsd = slicer.totalEarnedUsd.plus(usdcAmount)
  slicer.save()

  const currencySlicerId = currency + "-" + slicerId
  let currencySlicer = CurrencySlicer.load(currencySlicerId)

  if (!currencySlicer) {
    currencySlicer = new CurrencySlicer(currencySlicerId)
    currencySlicer.currency = currency
    currencySlicer.slicer = slicerId
    currencySlicer.released = BigInt.fromI32(0)
    currencySlicer.releasedUsd = BigInt.fromI32(0)
    currencySlicer.releasedToProtocol = BigInt.fromI32(0)
    currencySlicer.creatorFeePaid = BigInt.fromI32(0)
    currencySlicer.totalEarned = BigInt.fromI32(0)
  }

  currencySlicer.totalEarned = currencySlicer.totalEarned.plus(
    totalPaymentAmount
  )
  currencySlicer.save()

  let slicerStatsByYear = SlicerStatsByYear.load(
    slicerId + "-" + currentYear.toHex()
  )!
  slicerStatsByYear.totalEarnedUsd = slicerStatsByYear.totalEarnedUsd.plus(
    usdcAmount
  )
  slicerStatsByYear.save()

  let slicerStatsByMonth = SlicerStatsByMonth.load(
    slicerId + "-" + currentMonth.toHex()
  )!
  slicerStatsByMonth.totalEarnedUsd = slicerStatsByMonth.totalEarnedUsd.plus(
    usdcAmount
  )
  slicerStatsByMonth.save()

  let slicerStatsByWeek = SlicerStatsByWeek.load(
    slicerId + "-" + currentWeek.toHex()
  )!
  slicerStatsByWeek.totalEarnedUsd = slicerStatsByWeek.totalEarnedUsd.plus(
    usdcAmount
  )
  slicerStatsByWeek.save()

  let slicerStatsByDay = SlicerStatsByDay.load(
    slicerId + "-" + currentDay.toHex()
  )!
  slicerStatsByDay.totalEarnedUsd = slicerStatsByDay.totalEarnedUsd.plus(
    usdcAmount
  )
  slicerStatsByDay.save()

  let currencySlicerDay = CurrencySlicerDay.load(
    currencySlicerId + "-" + currentDay.toHex()
  )
  if (!currencySlicerDay) {
    currencySlicerDay = new CurrencySlicerDay(
      currencySlicerId + "-" + currentDay.toHex()
    )
    currencySlicerDay.slicer = slicerId
    currencySlicerDay.currency = currency
    currencySlicerDay.currencySlicer = currencySlicerId
    currencySlicerDay.slicerDay = slicerId + "-" + currentDay.toHex()
    currencySlicerDay.totalEarned = totalPaymentAmount
  } else {
    currencySlicerDay.totalEarned = currencySlicerDay.totalEarned.plus(
      totalPaymentAmount
    )
  }
  currencySlicerDay.save()

  let currencySlicerWeek = CurrencySlicerWeek.load(
    currencySlicerId + "-" + currentWeek.toHex()
  )
  if (!currencySlicerWeek) {
    currencySlicerWeek = new CurrencySlicerWeek(
      currencySlicerId + "-" + currentWeek.toHex()
    )
    currencySlicerWeek.slicer = slicerId
    currencySlicerWeek.currency = currency
    currencySlicerWeek.currencySlicer = currencySlicerId
    currencySlicerWeek.slicerWeek = slicerId + "-" + currentWeek.toHex()
    currencySlicerWeek.totalEarned = totalPaymentAmount
  } else {
    currencySlicerWeek.totalEarned = currencySlicerWeek.totalEarned.plus(
      totalPaymentAmount
    )
  }
  currencySlicerWeek.save()

  let currencySlicerMonth = CurrencySlicerMonth.load(
    currencySlicerId + "-" + currentMonth.toHex()
  )
  if (!currencySlicerMonth) {
    currencySlicerMonth = new CurrencySlicerMonth(
      currencySlicerId + "-" + currentMonth.toHex()
    )
    currencySlicerMonth.slicer = slicerId
    currencySlicerMonth.currency = currency
    currencySlicerMonth.currencySlicer = currencySlicerId
    currencySlicerMonth.slicerMonth = slicerId + "-" + currentMonth.toHex()
    currencySlicerMonth.totalEarned = totalPaymentAmount
  } else {
    currencySlicerMonth.totalEarned = currencySlicerMonth.totalEarned.plus(
      totalPaymentAmount
    )
  }
  currencySlicerMonth.save()

  let currencySlicerYear = CurrencySlicerYear.load(
    currencySlicerId + "-" + currentYear.toHex()
  )
  if (!currencySlicerYear) {
    currencySlicerYear = new CurrencySlicerYear(
      currencySlicerId + "-" + currentYear.toHex()
    )
    currencySlicerYear.slicer = slicerId
    currencySlicerYear.currency = currency
    currencySlicerYear.currencySlicer = currencySlicerId
    currencySlicerYear.slicerYear = slicerId + "-" + currentYear.toHex()
    currencySlicerYear.totalEarned = totalPaymentAmount
  } else {
    currencySlicerYear.totalEarned = currencySlicerYear.totalEarned.plus(
      totalPaymentAmount
    )
  }
  currencySlicerYear.save()
}

export function updateSlicerStatsTotalOrders(
  slicerId: string,
  timestamp: BigInt
): void {
  const datesValues = getDates(timestamp)

  const currentYear = datesValues.currentYear
  const currentMonth = datesValues.currentMonth
  const currentWeek = datesValues.currentWeek
  const currentDay = datesValues.currentDay

  let slicer = Slicer.load(slicerId)!
  slicer.totalOrders = slicer.totalOrders.plus(BigInt.fromI32(1))
  slicer.save()

  let slicerStatsByYear = SlicerStatsByYear.load(
    slicerId + "-" + currentYear.toHex()
  )

  if (!slicerStatsByYear) {
    slicerStatsByYear = new SlicerStatsByYear(
      slicerId + "-" + currentYear.toHex()
    )
    slicerStatsByYear.slicer = slicerId
    slicerStatsByYear.year = currentYear
    slicerStatsByYear.totalProductsPurchased = BigInt.fromI32(0)
    slicerStatsByYear.totalEarnedUsd = BigInt.fromI32(0)
    slicerStatsByYear.totalOrders = BigInt.fromI32(1)
  } else {
    slicerStatsByYear.totalOrders = slicerStatsByYear.totalOrders.plus(
      BigInt.fromI32(1)
    )
  }
  slicerStatsByYear.save()

  let slicerStatsByMonth = SlicerStatsByMonth.load(
    slicerId + "-" + currentMonth.toHex()
  )
  if (!slicerStatsByMonth) {
    slicerStatsByMonth = new SlicerStatsByMonth(
      slicerId + "-" + currentMonth.toHex()
    )
    slicerStatsByMonth.slicer = slicerId
    slicerStatsByMonth.month = currentMonth
    slicerStatsByMonth.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByMonth.totalProductsPurchased = BigInt.fromI32(0)
    slicerStatsByMonth.totalEarnedUsd = BigInt.fromI32(0)
    slicerStatsByMonth.totalOrders = BigInt.fromI32(1)
  } else {
    slicerStatsByMonth.totalOrders = slicerStatsByMonth.totalOrders.plus(
      BigInt.fromI32(1)
    )
  }
  slicerStatsByMonth.save()

  let slicerStatsByWeek = SlicerStatsByWeek.load(
    slicerId + "-" + currentWeek.toHex()
  )
  if (!slicerStatsByWeek) {
    slicerStatsByWeek = new SlicerStatsByWeek(
      slicerId + "-" + currentWeek.toHex()
    )
    slicerStatsByWeek.slicer = slicerId
    slicerStatsByWeek.week = currentWeek
    slicerStatsByWeek.month = slicerId + "-" + currentMonth.toHex()
    slicerStatsByWeek.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByWeek.totalProductsPurchased = BigInt.fromI32(0)
    slicerStatsByWeek.totalEarnedUsd = BigInt.fromI32(0)
    slicerStatsByWeek.totalOrders = BigInt.fromI32(1)
  } else {
    slicerStatsByWeek.totalOrders = slicerStatsByWeek.totalOrders.plus(
      BigInt.fromI32(1)
    )
  }
  slicerStatsByWeek.save()

  let slicerStatsByDay = SlicerStatsByDay.load(
    slicerId + "-" + currentDay.toHex()
  )
  if (!slicerStatsByDay) {
    slicerStatsByDay = new SlicerStatsByDay(slicerId + "-" + currentDay.toHex())
    slicerStatsByDay.slicer = slicerId
    slicerStatsByDay.day = currentDay
    slicerStatsByDay.week = slicerId + "-" + currentWeek.toHex()
    slicerStatsByDay.month = slicerId + "-" + currentMonth.toHex()
    slicerStatsByDay.year = slicerId + "-" + currentYear.toHex()
    slicerStatsByDay.totalProductsPurchased = BigInt.fromI32(0)
    slicerStatsByDay.totalEarnedUsd = BigInt.fromI32(0)
    slicerStatsByDay.totalOrders = BigInt.fromI32(1)
  } else {
    slicerStatsByDay.totalOrders = slicerStatsByDay.totalOrders.plus(
      BigInt.fromI32(1)
    )
  }
  slicerStatsByDay.save()
}

export function getDates(timestamp: BigInt): Dates {
  const currentDay = timestamp.div(BigInt.fromI32(86400)) // .plus(BigInt.fromI32(35_743_680_000))
  const currentWeek = currentDay.div(BigInt.fromI32(7)) // .plus(BigInt.fromI32(413_700))
  const currentMonth = currentDay.div(BigInt.fromI32(30)) // .plus(BigInt.fromI32(59_100))
  const currentYear = currentDay.div(BigInt.fromI32(365)) // .plus(BigInt.fromI32(1_970))
  return Dates.create(currentDay, currentWeek, currentMonth, currentYear)
}
