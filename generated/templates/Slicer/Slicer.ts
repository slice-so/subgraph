// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  ethereum,
  JSONValue,
  TypedMap,
  Entity,
  Bytes,
  Address,
  BigInt
} from "@graphprotocol/graph-ts";

export class ChildSlicerSet extends ethereum.Event {
  get params(): ChildSlicerSet__Params {
    return new ChildSlicerSet__Params(this);
  }
}

export class ChildSlicerSet__Params {
  _event: ChildSlicerSet;

  constructor(event: ChildSlicerSet) {
    this._event = event;
  }

  get slicerId(): BigInt {
    return this._event.parameters[0].value.toBigInt();
  }

  get addChildSlicerMode(): boolean {
    return this._event.parameters[1].value.toBoolean();
  }
}

export class CurrenciesAdded extends ethereum.Event {
  get params(): CurrenciesAdded__Params {
    return new CurrenciesAdded__Params(this);
  }
}

export class CurrenciesAdded__Params {
  _event: CurrenciesAdded;

  constructor(event: CurrenciesAdded) {
    this._event = event;
  }

  get currencies(): Array<Address> {
    return this._event.parameters[0].value.toAddressArray();
  }
}

export class CustomFeeSet extends ethereum.Event {
  get params(): CustomFeeSet__Params {
    return new CustomFeeSet__Params(this);
  }
}

export class CustomFeeSet__Params {
  _event: CustomFeeSet;

  constructor(event: CustomFeeSet) {
    this._event = event;
  }

  get customFeeActive(): boolean {
    return this._event.parameters[0].value.toBoolean();
  }

  get customFee(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class ERC1155BatchReceived extends ethereum.Event {
  get params(): ERC1155BatchReceived__Params {
    return new ERC1155BatchReceived__Params(this);
  }
}

export class ERC1155BatchReceived__Params {
  _event: ERC1155BatchReceived;

  constructor(event: ERC1155BatchReceived) {
    this._event = event;
  }

  get contractAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenIds(): Array<BigInt> {
    return this._event.parameters[2].value.toBigIntArray();
  }

  get amounts(): Array<BigInt> {
    return this._event.parameters[3].value.toBigIntArray();
  }
}

export class ERC1155Received extends ethereum.Event {
  get params(): ERC1155Received__Params {
    return new ERC1155Received__Params(this);
  }
}

export class ERC1155Received__Params {
  _event: ERC1155Received;

  constructor(event: ERC1155Received) {
    this._event = event;
  }

  get contractAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get amount(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class ERC721Received extends ethereum.Event {
  get params(): ERC721Received__Params {
    return new ERC721Received__Params(this);
  }
}

export class ERC721Received__Params {
  _event: ERC721Received;

  constructor(event: ERC721Received) {
    this._event = event;
  }

  get contractAddress(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get from(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }
}

export class PaymentReceived extends ethereum.Event {
  get params(): PaymentReceived__Params {
    return new PaymentReceived__Params(this);
  }
}

export class PaymentReceived__Params {
  _event: PaymentReceived;

  constructor(event: PaymentReceived) {
    this._event = event;
  }

  get from(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get amount(): BigInt {
    return this._event.parameters[1].value.toBigInt();
  }
}

export class Released extends ethereum.Event {
  get params(): Released__Params {
    return new Released__Params(this);
  }
}

export class Released__Params {
  _event: Released;

  constructor(event: Released) {
    this._event = event;
  }

  get payee(): Address {
    return this._event.parameters[0].value.toAddress();
  }

  get currency(): Address {
    return this._event.parameters[1].value.toAddress();
  }

  get amountReleased(): BigInt {
    return this._event.parameters[2].value.toBigInt();
  }

  get protocolPayment(): BigInt {
    return this._event.parameters[3].value.toBigInt();
  }
}

export class Slicer___releaseFromFundsModuleResult {
  value0: BigInt;
  value1: BigInt;

  constructor(value0: BigInt, value1: BigInt) {
    this.value0 = value0;
    this.value1 = value1;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    return map;
  }

  getAmount(): BigInt {
    return this.value0;
  }

  getProtocolPayment(): BigInt {
    return this.value1;
  }
}

export class Slicer__slicerInfoResult {
  value0: BigInt;
  value1: BigInt;
  value2: Address;
  value3: boolean;
  value4: boolean;
  value5: Array<Address>;

  constructor(
    value0: BigInt,
    value1: BigInt,
    value2: Address,
    value3: boolean,
    value4: boolean,
    value5: Array<Address>
  ) {
    this.value0 = value0;
    this.value1 = value1;
    this.value2 = value2;
    this.value3 = value3;
    this.value4 = value4;
    this.value5 = value5;
  }

  toMap(): TypedMap<string, ethereum.Value> {
    let map = new TypedMap<string, ethereum.Value>();
    map.set("value0", ethereum.Value.fromUnsignedBigInt(this.value0));
    map.set("value1", ethereum.Value.fromUnsignedBigInt(this.value1));
    map.set("value2", ethereum.Value.fromAddress(this.value2));
    map.set("value3", ethereum.Value.fromBoolean(this.value3));
    map.set("value4", ethereum.Value.fromBoolean(this.value4));
    map.set("value5", ethereum.Value.fromAddressArray(this.value5));
    return map;
  }

  getTokenId(): BigInt {
    return this.value0;
  }

  getMinimumShares(): BigInt {
    return this.value1;
  }

  getCreator(): Address {
    return this.value2;
  }

  getIsImmutable(): boolean {
    return this.value3;
  }

  getIsControlled(): boolean {
    return this.value4;
  }

  getCurrencies(): Array<Address> {
    return this.value5;
  }
}

export class Slicer extends ethereum.SmartContract {
  static bind(address: Address): Slicer {
    return new Slicer("Slicer", address);
  }

  _releaseFromFundsModule(
    account: Address,
    currency: Address
  ): Slicer___releaseFromFundsModuleResult {
    let result = super.call(
      "_releaseFromFundsModule",
      "_releaseFromFundsModule(address,address):(uint256,uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(currency)
      ]
    );

    return new Slicer___releaseFromFundsModuleResult(
      result[0].toBigInt(),
      result[1].toBigInt()
    );
  }

  try__releaseFromFundsModule(
    account: Address,
    currency: Address
  ): ethereum.CallResult<Slicer___releaseFromFundsModuleResult> {
    let result = super.tryCall(
      "_releaseFromFundsModule",
      "_releaseFromFundsModule(address,address):(uint256,uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(currency)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Slicer___releaseFromFundsModuleResult(
        value[0].toBigInt(),
        value[1].toBigInt()
      )
    );
  }

  acceptsCurrency(currency: Address): boolean {
    let result = super.call(
      "acceptsCurrency",
      "acceptsCurrency(address):(bool)",
      [ethereum.Value.fromAddress(currency)]
    );

    return result[0].toBoolean();
  }

  try_acceptsCurrency(currency: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "acceptsCurrency",
      "acceptsCurrency(address):(bool)",
      [ethereum.Value.fromAddress(currency)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  getFee(): BigInt {
    let result = super.call("getFee", "getFee():(uint256)", []);

    return result[0].toBigInt();
  }

  try_getFee(): ethereum.CallResult<BigInt> {
    let result = super.tryCall("getFee", "getFee():(uint256)", []);
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }

  isPayeeAllowed(payee: Address): boolean {
    let result = super.call(
      "isPayeeAllowed",
      "isPayeeAllowed(address):(bool)",
      [ethereum.Value.fromAddress(payee)]
    );

    return result[0].toBoolean();
  }

  try_isPayeeAllowed(payee: Address): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "isPayeeAllowed",
      "isPayeeAllowed(address):(bool)",
      [ethereum.Value.fromAddress(payee)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  onERC1155BatchReceived(
    param0: Address,
    from: Address,
    tokenIds: Array<BigInt>,
    amounts: Array<BigInt>,
    param4: Bytes
  ): Bytes {
    let result = super.call(
      "onERC1155BatchReceived",
      "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigIntArray(tokenIds),
        ethereum.Value.fromUnsignedBigIntArray(amounts),
        ethereum.Value.fromBytes(param4)
      ]
    );

    return result[0].toBytes();
  }

  try_onERC1155BatchReceived(
    param0: Address,
    from: Address,
    tokenIds: Array<BigInt>,
    amounts: Array<BigInt>,
    param4: Bytes
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "onERC1155BatchReceived",
      "onERC1155BatchReceived(address,address,uint256[],uint256[],bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigIntArray(tokenIds),
        ethereum.Value.fromUnsignedBigIntArray(amounts),
        ethereum.Value.fromBytes(param4)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  onERC1155Received(
    param0: Address,
    from: Address,
    tokenId: BigInt,
    amount: BigInt,
    param4: Bytes
  ): Bytes {
    let result = super.call(
      "onERC1155Received",
      "onERC1155Received(address,address,uint256,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBytes(param4)
      ]
    );

    return result[0].toBytes();
  }

  try_onERC1155Received(
    param0: Address,
    from: Address,
    tokenId: BigInt,
    amount: BigInt,
    param4: Bytes
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "onERC1155Received",
      "onERC1155Received(address,address,uint256,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromUnsignedBigInt(amount),
        ethereum.Value.fromBytes(param4)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  onERC721Received(
    param0: Address,
    from: Address,
    tokenId: BigInt,
    param3: Bytes
  ): Bytes {
    let result = super.call(
      "onERC721Received",
      "onERC721Received(address,address,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromBytes(param3)
      ]
    );

    return result[0].toBytes();
  }

  try_onERC721Received(
    param0: Address,
    from: Address,
    tokenId: BigInt,
    param3: Bytes
  ): ethereum.CallResult<Bytes> {
    let result = super.tryCall(
      "onERC721Received",
      "onERC721Received(address,address,uint256,bytes):(bytes4)",
      [
        ethereum.Value.fromAddress(param0),
        ethereum.Value.fromAddress(from),
        ethereum.Value.fromUnsignedBigInt(tokenId),
        ethereum.Value.fromBytes(param3)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBytes());
  }

  slicerInfo(): Slicer__slicerInfoResult {
    let result = super.call(
      "slicerInfo",
      "slicerInfo():(uint256,uint256,address,bool,bool,address[])",
      []
    );

    return new Slicer__slicerInfoResult(
      result[0].toBigInt(),
      result[1].toBigInt(),
      result[2].toAddress(),
      result[3].toBoolean(),
      result[4].toBoolean(),
      result[5].toAddressArray()
    );
  }

  try_slicerInfo(): ethereum.CallResult<Slicer__slicerInfoResult> {
    let result = super.tryCall(
      "slicerInfo",
      "slicerInfo():(uint256,uint256,address,bool,bool,address[])",
      []
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(
      new Slicer__slicerInfoResult(
        value[0].toBigInt(),
        value[1].toBigInt(),
        value[2].toAddress(),
        value[3].toBoolean(),
        value[4].toBoolean(),
        value[5].toAddressArray()
      )
    );
  }

  supportsInterface(interfaceId: Bytes): boolean {
    let result = super.call(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );

    return result[0].toBoolean();
  }

  try_supportsInterface(interfaceId: Bytes): ethereum.CallResult<boolean> {
    let result = super.tryCall(
      "supportsInterface",
      "supportsInterface(bytes4):(bool)",
      [ethereum.Value.fromFixedBytes(interfaceId)]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBoolean());
  }

  unreleased(account: Address, currency: Address): BigInt {
    let result = super.call(
      "unreleased",
      "unreleased(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(currency)
      ]
    );

    return result[0].toBigInt();
  }

  try_unreleased(
    account: Address,
    currency: Address
  ): ethereum.CallResult<BigInt> {
    let result = super.tryCall(
      "unreleased",
      "unreleased(address,address):(uint256)",
      [
        ethereum.Value.fromAddress(account),
        ethereum.Value.fromAddress(currency)
      ]
    );
    if (result.reverted) {
      return new ethereum.CallResult();
    }
    let value = result.value;
    return ethereum.CallResult.fromValue(value[0].toBigInt());
  }
}

export class _addCurrenciesCall extends ethereum.Call {
  get inputs(): _addCurrenciesCall__Inputs {
    return new _addCurrenciesCall__Inputs(this);
  }

  get outputs(): _addCurrenciesCall__Outputs {
    return new _addCurrenciesCall__Outputs(this);
  }
}

export class _addCurrenciesCall__Inputs {
  _call: _addCurrenciesCall;

  constructor(call: _addCurrenciesCall) {
    this._call = call;
  }

  get currencies(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }
}

export class _addCurrenciesCall__Outputs {
  _call: _addCurrenciesCall;

  constructor(call: _addCurrenciesCall) {
    this._call = call;
  }
}

export class _handle1155PurchaseCall extends ethereum.Call {
  get inputs(): _handle1155PurchaseCall__Inputs {
    return new _handle1155PurchaseCall__Inputs(this);
  }

  get outputs(): _handle1155PurchaseCall__Outputs {
    return new _handle1155PurchaseCall__Outputs(this);
  }
}

export class _handle1155PurchaseCall__Inputs {
  _call: _handle1155PurchaseCall;

  constructor(call: _handle1155PurchaseCall) {
    this._call = call;
  }

  get buyer(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get contractAddress(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get quantity(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }
}

export class _handle1155PurchaseCall__Outputs {
  _call: _handle1155PurchaseCall;

  constructor(call: _handle1155PurchaseCall) {
    this._call = call;
  }
}

export class _handle721PurchaseCall extends ethereum.Call {
  get inputs(): _handle721PurchaseCall__Inputs {
    return new _handle721PurchaseCall__Inputs(this);
  }

  get outputs(): _handle721PurchaseCall__Outputs {
    return new _handle721PurchaseCall__Outputs(this);
  }
}

export class _handle721PurchaseCall__Inputs {
  _call: _handle721PurchaseCall;

  constructor(call: _handle721PurchaseCall) {
    this._call = call;
  }

  get buyer(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get contractAddress(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class _handle721PurchaseCall__Outputs {
  _call: _handle721PurchaseCall;

  constructor(call: _handle721PurchaseCall) {
    this._call = call;
  }
}

export class _initializeCall extends ethereum.Call {
  get inputs(): _initializeCall__Inputs {
    return new _initializeCall__Inputs(this);
  }

  get outputs(): _initializeCall__Outputs {
    return new _initializeCall__Outputs(this);
  }
}

export class _initializeCall__Inputs {
  _call: _initializeCall;

  constructor(call: _initializeCall) {
    this._call = call;
  }

  get tokenId_(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get isImmutable_(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }

  get isControlled_(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }

  get slicerCreator_(): Address {
    return this._call.inputValues[3].value.toAddress();
  }

  get minimumShares_(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }

  get releaseTimelock_(): BigInt {
    return this._call.inputValues[5].value.toBigInt();
  }

  get currencies_(): Array<Address> {
    return this._call.inputValues[6].value.toAddressArray();
  }
}

export class _initializeCall__Outputs {
  _call: _initializeCall;

  constructor(call: _initializeCall) {
    this._call = call;
  }
}

export class _releaseFromFundsModuleCall extends ethereum.Call {
  get inputs(): _releaseFromFundsModuleCall__Inputs {
    return new _releaseFromFundsModuleCall__Inputs(this);
  }

  get outputs(): _releaseFromFundsModuleCall__Outputs {
    return new _releaseFromFundsModuleCall__Outputs(this);
  }
}

export class _releaseFromFundsModuleCall__Inputs {
  _call: _releaseFromFundsModuleCall;

  constructor(call: _releaseFromFundsModuleCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get currency(): Address {
    return this._call.inputValues[1].value.toAddress();
  }
}

export class _releaseFromFundsModuleCall__Outputs {
  _call: _releaseFromFundsModuleCall;

  constructor(call: _releaseFromFundsModuleCall) {
    this._call = call;
  }

  get amount(): BigInt {
    return this._call.outputValues[0].value.toBigInt();
  }

  get protocolPayment(): BigInt {
    return this._call.outputValues[1].value.toBigInt();
  }
}

export class _releaseFromSliceCoreCall extends ethereum.Call {
  get inputs(): _releaseFromSliceCoreCall__Inputs {
    return new _releaseFromSliceCoreCall__Inputs(this);
  }

  get outputs(): _releaseFromSliceCoreCall__Outputs {
    return new _releaseFromSliceCoreCall__Outputs(this);
  }
}

export class _releaseFromSliceCoreCall__Inputs {
  _call: _releaseFromSliceCoreCall;

  constructor(call: _releaseFromSliceCoreCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get currency(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get accountSlices(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class _releaseFromSliceCoreCall__Outputs {
  _call: _releaseFromSliceCoreCall;

  constructor(call: _releaseFromSliceCoreCall) {
    this._call = call;
  }
}

export class _setChildSlicerCall extends ethereum.Call {
  get inputs(): _setChildSlicerCall__Inputs {
    return new _setChildSlicerCall__Inputs(this);
  }

  get outputs(): _setChildSlicerCall__Outputs {
    return new _setChildSlicerCall__Outputs(this);
  }
}

export class _setChildSlicerCall__Inputs {
  _call: _setChildSlicerCall;

  constructor(call: _setChildSlicerCall) {
    this._call = call;
  }

  get id(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }

  get isAdded(): boolean {
    return this._call.inputValues[1].value.toBoolean();
  }
}

export class _setChildSlicerCall__Outputs {
  _call: _setChildSlicerCall;

  constructor(call: _setChildSlicerCall) {
    this._call = call;
  }
}

export class _setCustomFeeCall extends ethereum.Call {
  get inputs(): _setCustomFeeCall__Inputs {
    return new _setCustomFeeCall__Inputs(this);
  }

  get outputs(): _setCustomFeeCall__Outputs {
    return new _setCustomFeeCall__Outputs(this);
  }
}

export class _setCustomFeeCall__Inputs {
  _call: _setCustomFeeCall;

  constructor(call: _setCustomFeeCall) {
    this._call = call;
  }

  get customFeeActive(): boolean {
    return this._call.inputValues[0].value.toBoolean();
  }

  get customFee(): BigInt {
    return this._call.inputValues[1].value.toBigInt();
  }
}

export class _setCustomFeeCall__Outputs {
  _call: _setCustomFeeCall;

  constructor(call: _setCustomFeeCall) {
    this._call = call;
  }
}

export class _setTotalSharesCall extends ethereum.Call {
  get inputs(): _setTotalSharesCall__Inputs {
    return new _setTotalSharesCall__Inputs(this);
  }

  get outputs(): _setTotalSharesCall__Outputs {
    return new _setTotalSharesCall__Outputs(this);
  }
}

export class _setTotalSharesCall__Inputs {
  _call: _setTotalSharesCall;

  constructor(call: _setTotalSharesCall) {
    this._call = call;
  }

  get totalShares(): BigInt {
    return this._call.inputValues[0].value.toBigInt();
  }
}

export class _setTotalSharesCall__Outputs {
  _call: _setTotalSharesCall;

  constructor(call: _setTotalSharesCall) {
    this._call = call;
  }
}

export class _updatePayeesCall extends ethereum.Call {
  get inputs(): _updatePayeesCall__Inputs {
    return new _updatePayeesCall__Inputs(this);
  }

  get outputs(): _updatePayeesCall__Outputs {
    return new _updatePayeesCall__Outputs(this);
  }
}

export class _updatePayeesCall__Inputs {
  _call: _updatePayeesCall;

  constructor(call: _updatePayeesCall) {
    this._call = call;
  }

  get sender(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get receiver(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get toRelease(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }

  get senderShares(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get transferredShares(): BigInt {
    return this._call.inputValues[4].value.toBigInt();
  }
}

export class _updatePayeesCall__Outputs {
  _call: _updatePayeesCall;

  constructor(call: _updatePayeesCall) {
    this._call = call;
  }
}

export class _updatePayeesResliceCall extends ethereum.Call {
  get inputs(): _updatePayeesResliceCall__Inputs {
    return new _updatePayeesResliceCall__Inputs(this);
  }

  get outputs(): _updatePayeesResliceCall__Outputs {
    return new _updatePayeesResliceCall__Outputs(this);
  }
}

export class _updatePayeesResliceCall__Inputs {
  _call: _updatePayeesResliceCall;

  constructor(call: _updatePayeesResliceCall) {
    this._call = call;
  }

  get accounts(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get tokensDiffs(): Array<i32> {
    return this._call.inputValues[1].value.toI32Array();
  }

  get totalSupply(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }
}

export class _updatePayeesResliceCall__Outputs {
  _call: _updatePayeesResliceCall;

  constructor(call: _updatePayeesResliceCall) {
    this._call = call;
  }
}

export class BatchReleaseAccountsCall extends ethereum.Call {
  get inputs(): BatchReleaseAccountsCall__Inputs {
    return new BatchReleaseAccountsCall__Inputs(this);
  }

  get outputs(): BatchReleaseAccountsCall__Outputs {
    return new BatchReleaseAccountsCall__Outputs(this);
  }
}

export class BatchReleaseAccountsCall__Inputs {
  _call: BatchReleaseAccountsCall;

  constructor(call: BatchReleaseAccountsCall) {
    this._call = call;
  }

  get accounts(): Array<Address> {
    return this._call.inputValues[0].value.toAddressArray();
  }

  get currency(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get withdraw(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class BatchReleaseAccountsCall__Outputs {
  _call: BatchReleaseAccountsCall;

  constructor(call: BatchReleaseAccountsCall) {
    this._call = call;
  }
}

export class OnERC1155BatchReceivedCall extends ethereum.Call {
  get inputs(): OnERC1155BatchReceivedCall__Inputs {
    return new OnERC1155BatchReceivedCall__Inputs(this);
  }

  get outputs(): OnERC1155BatchReceivedCall__Outputs {
    return new OnERC1155BatchReceivedCall__Outputs(this);
  }
}

export class OnERC1155BatchReceivedCall__Inputs {
  _call: OnERC1155BatchReceivedCall;

  constructor(call: OnERC1155BatchReceivedCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get from(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenIds(): Array<BigInt> {
    return this._call.inputValues[2].value.toBigIntArray();
  }

  get amounts(): Array<BigInt> {
    return this._call.inputValues[3].value.toBigIntArray();
  }

  get value4(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class OnERC1155BatchReceivedCall__Outputs {
  _call: OnERC1155BatchReceivedCall;

  constructor(call: OnERC1155BatchReceivedCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class OnERC1155ReceivedCall extends ethereum.Call {
  get inputs(): OnERC1155ReceivedCall__Inputs {
    return new OnERC1155ReceivedCall__Inputs(this);
  }

  get outputs(): OnERC1155ReceivedCall__Outputs {
    return new OnERC1155ReceivedCall__Outputs(this);
  }
}

export class OnERC1155ReceivedCall__Inputs {
  _call: OnERC1155ReceivedCall;

  constructor(call: OnERC1155ReceivedCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get from(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get amount(): BigInt {
    return this._call.inputValues[3].value.toBigInt();
  }

  get value4(): Bytes {
    return this._call.inputValues[4].value.toBytes();
  }
}

export class OnERC1155ReceivedCall__Outputs {
  _call: OnERC1155ReceivedCall;

  constructor(call: OnERC1155ReceivedCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class OnERC721ReceivedCall extends ethereum.Call {
  get inputs(): OnERC721ReceivedCall__Inputs {
    return new OnERC721ReceivedCall__Inputs(this);
  }

  get outputs(): OnERC721ReceivedCall__Outputs {
    return new OnERC721ReceivedCall__Outputs(this);
  }
}

export class OnERC721ReceivedCall__Inputs {
  _call: OnERC721ReceivedCall;

  constructor(call: OnERC721ReceivedCall) {
    this._call = call;
  }

  get value0(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get from(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get tokenId(): BigInt {
    return this._call.inputValues[2].value.toBigInt();
  }

  get value3(): Bytes {
    return this._call.inputValues[3].value.toBytes();
  }
}

export class OnERC721ReceivedCall__Outputs {
  _call: OnERC721ReceivedCall;

  constructor(call: OnERC721ReceivedCall) {
    this._call = call;
  }

  get value0(): Bytes {
    return this._call.outputValues[0].value.toBytes();
  }
}

export class ReleaseCall extends ethereum.Call {
  get inputs(): ReleaseCall__Inputs {
    return new ReleaseCall__Inputs(this);
  }

  get outputs(): ReleaseCall__Outputs {
    return new ReleaseCall__Outputs(this);
  }
}

export class ReleaseCall__Inputs {
  _call: ReleaseCall;

  constructor(call: ReleaseCall) {
    this._call = call;
  }

  get account(): Address {
    return this._call.inputValues[0].value.toAddress();
  }

  get currency(): Address {
    return this._call.inputValues[1].value.toAddress();
  }

  get withdraw(): boolean {
    return this._call.inputValues[2].value.toBoolean();
  }
}

export class ReleaseCall__Outputs {
  _call: ReleaseCall;

  constructor(call: ReleaseCall) {
    this._call = call;
  }
}
