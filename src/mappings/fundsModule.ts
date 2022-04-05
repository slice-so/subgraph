import { Payee, PayeeCurrency } from "../../generated/schema"
import {
  Deposited as DepositedEvent,
  Withdrawn as WithdrawnEvent
} from "../../generated/FundsModule/FundsModule"
import { BigInt } from "@graphprotocol/graph-ts"

export function handleDeposited(event: DepositedEvent): void {
  let account = event.params.account.toHexString()
  let currency = event.params.currency
  let amount = event.params.amount
  let protocolAmount = event.params.protocolAmount
  let currencyAddress = currency.toHexString()

  let payee = Payee.load(account)
  if (!payee) {
    payee = new Payee(account)
    payee.save()
  }

  let payeeCurrency = PayeeCurrency.load(account + "-" + currencyAddress)
  if (!payeeCurrency) {
    payeeCurrency = new PayeeCurrency(account + "-" + currencyAddress)
    payeeCurrency.payee = account
    payeeCurrency.currency = currencyAddress
  }
  payeeCurrency.toWithdraw = payeeCurrency.toWithdraw.plus(
    amount.minus(protocolAmount)
  )
  payeeCurrency.toPayToProtocol = payeeCurrency.toPayToProtocol.plus(
    protocolAmount
  )
  payeeCurrency.save()
}

export function handleWithdrawn(event: WithdrawnEvent): void {
  let account = event.params.account.toHexString()
  let currency = event.params.currency
  let amount = event.params.withdrawAmount
  let protocolAmount = event.params.protocolPayment
  let currencyAddress = currency.toHexString()

  let payee = Payee.load(account)
  if (!payee) {
    payee = new Payee(account)
    payee.save()
  }

  let payeeCurrency = PayeeCurrency.load(account + "-" + currencyAddress)
  if (!payeeCurrency) {
    payeeCurrency = new PayeeCurrency(account + "-" + currencyAddress)
    payeeCurrency.payee = account
    payeeCurrency.currency = currencyAddress
  }
  payeeCurrency.withdrawn = payeeCurrency.withdrawn.plus(amount)
  payeeCurrency.paidToProtocol = payeeCurrency.paidToProtocol.plus(
    protocolAmount
  )
  payeeCurrency.toWithdraw = BigInt.fromI32(1)
  payeeCurrency.toPayToProtocol = BigInt.fromI32(1)
  payeeCurrency.save()
}
