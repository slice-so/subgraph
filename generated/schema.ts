// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  TypedMap,
  Entity,
  Value,
  ValueKind,
  store,
  Address,
  Bytes,
  BigInt,
  BigDecimal
} from "@graphprotocol/graph-ts";

export class Slicer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Slicer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Slicer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Slicer", id.toString(), this);
  }

  static load(id: string): Slicer | null {
    return store.get("Slicer", id) as Slicer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get address(): Bytes {
    let value = this.get("address");
    return value.toBytes();
  }

  set address(value: Bytes) {
    this.set("address", Value.fromBytes(value));
  }

  get slices(): BigInt {
    let value = this.get("slices");
    return value.toBigInt();
  }

  set slices(value: BigInt) {
    this.set("slices", Value.fromBigInt(value));
  }

  get minimumSlices(): BigInt {
    let value = this.get("minimumSlices");
    return value.toBigInt();
  }

  set minimumSlices(value: BigInt) {
    this.set("minimumSlices", Value.fromBigInt(value));
  }

  get totalReceived(): BigInt {
    let value = this.get("totalReceived");
    return value.toBigInt();
  }

  set totalReceived(value: BigInt) {
    this.set("totalReceived", Value.fromBigInt(value));
  }

  get isCollectible(): boolean {
    let value = this.get("isCollectible");
    return value.toBoolean();
  }

  set isCollectible(value: boolean) {
    this.set("isCollectible", Value.fromBoolean(value));
  }

  get creator(): string {
    let value = this.get("creator");
    return value.toString();
  }

  set creator(value: string) {
    this.set("creator", Value.fromString(value));
  }

  get payees(): Array<string> {
    let value = this.get("payees");
    return value.toStringArray();
  }

  set payees(value: Array<string>) {
    this.set("payees", Value.fromStringArray(value));
  }

  get products(): Array<string> {
    let value = this.get("products");
    return value.toStringArray();
  }

  set products(value: Array<string>) {
    this.set("products", Value.fromStringArray(value));
  }

  get childrenSlicers(): Array<string> | null {
    let value = this.get("childrenSlicers");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toStringArray();
    }
  }

  set childrenSlicers(value: Array<string> | null) {
    if (value === null) {
      this.unset("childrenSlicers");
    } else {
      this.set(
        "childrenSlicers",
        Value.fromStringArray(value as Array<string>)
      );
    }
  }

  get createdAtTimestamp(): BigInt {
    let value = this.get("createdAtTimestamp");
    return value.toBigInt();
  }

  set createdAtTimestamp(value: BigInt) {
    this.set("createdAtTimestamp", Value.fromBigInt(value));
  }
}

export class Payee extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Payee entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Payee entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Payee", id.toString(), this);
  }

  static load(id: string): Payee | null {
    return store.get("Payee", id) as Payee | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get slc(): BigInt | null {
    let value = this.get("slc");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set slc(value: BigInt | null) {
    if (value === null) {
      this.unset("slc");
    } else {
      this.set("slc", Value.fromBigInt(value as BigInt));
    }
  }

  get slicers(): Array<string> {
    let value = this.get("slicers");
    return value.toStringArray();
  }

  set slicers(value: Array<string>) {
    this.set("slicers", Value.fromStringArray(value));
  }

  get created(): Array<string> {
    let value = this.get("created");
    return value.toStringArray();
  }

  set created(value: Array<string>) {
    this.set("created", Value.fromStringArray(value));
  }

  get purchases(): Array<string> {
    let value = this.get("purchases");
    return value.toStringArray();
  }

  set purchases(value: Array<string>) {
    this.set("purchases", Value.fromStringArray(value));
  }
}

export class PayeeSlicer extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save PayeeSlicer entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save PayeeSlicer entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("PayeeSlicer", id.toString(), this);
  }

  static load(id: string): PayeeSlicer | null {
    return store.get("PayeeSlicer", id) as PayeeSlicer | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get payee(): string {
    let value = this.get("payee");
    return value.toString();
  }

  set payee(value: string) {
    this.set("payee", Value.fromString(value));
  }

  get slicer(): string {
    let value = this.get("slicer");
    return value.toString();
  }

  set slicer(value: string) {
    this.set("slicer", Value.fromString(value));
  }

  get slices(): BigInt {
    let value = this.get("slices");
    return value.toBigInt();
  }

  set slices(value: BigInt) {
    this.set("slices", Value.fromBigInt(value));
  }

  get released(): BigInt | null {
    let value = this.get("released");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set released(value: BigInt | null) {
    if (value === null) {
      this.unset("released");
    } else {
      this.set("released", Value.fromBigInt(value as BigInt));
    }
  }

  get totalPaid(): BigInt | null {
    let value = this.get("totalPaid");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set totalPaid(value: BigInt | null) {
    if (value === null) {
      this.unset("totalPaid");
    } else {
      this.set("totalPaid", Value.fromBigInt(value as BigInt));
    }
  }

  get totalPaidProducts(): BigInt | null {
    let value = this.get("totalPaidProducts");
    if (value === null || value.kind == ValueKind.NULL) {
      return null;
    } else {
      return value.toBigInt();
    }
  }

  set totalPaidProducts(value: BigInt | null) {
    if (value === null) {
      this.unset("totalPaidProducts");
    } else {
      this.set("totalPaidProducts", Value.fromBigInt(value as BigInt));
    }
  }

  get purchases(): Array<string> {
    let value = this.get("purchases");
    return value.toStringArray();
  }

  set purchases(value: Array<string>) {
    this.set("purchases", Value.fromStringArray(value));
  }
}

export class Product extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save Product entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save Product entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("Product", id.toString(), this);
  }

  static load(id: string): Product | null {
    return store.get("Product", id) as Product | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get slicer(): string {
    let value = this.get("slicer");
    return value.toString();
  }

  set slicer(value: string) {
    this.set("slicer", Value.fromString(value));
  }

  get categoryIndex(): BigInt {
    let value = this.get("categoryIndex");
    return value.toBigInt();
  }

  set categoryIndex(value: BigInt) {
    this.set("categoryIndex", Value.fromBigInt(value));
  }

  get price(): BigInt {
    let value = this.get("price");
    return value.toBigInt();
  }

  set price(value: BigInt) {
    this.set("price", Value.fromBigInt(value));
  }

  get isUSD(): boolean {
    let value = this.get("isUSD");
    return value.toBoolean();
  }

  set isUSD(value: boolean) {
    this.set("isUSD", Value.fromBoolean(value));
  }

  get isInfinite(): boolean {
    let value = this.get("isInfinite");
    return value.toBoolean();
  }

  set isInfinite(value: boolean) {
    this.set("isInfinite", Value.fromBoolean(value));
  }

  get isMultiple(): boolean {
    let value = this.get("isMultiple");
    return value.toBoolean();
  }

  set isMultiple(value: boolean) {
    this.set("isMultiple", Value.fromBoolean(value));
  }

  get availableUnits(): BigInt {
    let value = this.get("availableUnits");
    return value.toBigInt();
  }

  set availableUnits(value: BigInt) {
    this.set("availableUnits", Value.fromBigInt(value));
  }

  get creator(): Bytes {
    let value = this.get("creator");
    return value.toBytes();
  }

  set creator(value: Bytes) {
    this.set("creator", Value.fromBytes(value));
  }

  get data(): Bytes {
    let value = this.get("data");
    return value.toBytes();
  }

  set data(value: Bytes) {
    this.set("data", Value.fromBytes(value));
  }

  get totalPurchases(): BigInt {
    let value = this.get("totalPurchases");
    return value.toBigInt();
  }

  set totalPurchases(value: BigInt) {
    this.set("totalPurchases", Value.fromBigInt(value));
  }

  get subProducts(): Array<string> {
    let value = this.get("subProducts");
    return value.toStringArray();
  }

  set subProducts(value: Array<string>) {
    this.set("subProducts", Value.fromStringArray(value));
  }

  get purchases(): Array<string> {
    let value = this.get("purchases");
    return value.toStringArray();
  }

  set purchases(value: Array<string>) {
    this.set("purchases", Value.fromStringArray(value));
  }

  get createdAtTimestamp(): BigInt {
    let value = this.get("createdAtTimestamp");
    return value.toBigInt();
  }

  set createdAtTimestamp(value: BigInt) {
    this.set("createdAtTimestamp", Value.fromBigInt(value));
  }
}

export class ProductPurchase extends Entity {
  constructor(id: string) {
    super();
    this.set("id", Value.fromString(id));
  }

  save(): void {
    let id = this.get("id");
    assert(id !== null, "Cannot save ProductPurchase entity without an ID");
    assert(
      id.kind == ValueKind.STRING,
      "Cannot save ProductPurchase entity with non-string ID. " +
        'Considering using .toHex() to convert the "id" to a string.'
    );
    store.set("ProductPurchase", id.toString(), this);
  }

  static load(id: string): ProductPurchase | null {
    return store.get("ProductPurchase", id) as ProductPurchase | null;
  }

  get id(): string {
    let value = this.get("id");
    return value.toString();
  }

  set id(value: string) {
    this.set("id", Value.fromString(value));
  }

  get product(): string {
    let value = this.get("product");
    return value.toString();
  }

  set product(value: string) {
    this.set("product", Value.fromString(value));
  }

  get buyerSlicer(): string {
    let value = this.get("buyerSlicer");
    return value.toString();
  }

  set buyerSlicer(value: string) {
    this.set("buyerSlicer", Value.fromString(value));
  }

  get buyer(): string {
    let value = this.get("buyer");
    return value.toString();
  }

  set buyer(value: string) {
    this.set("buyer", Value.fromString(value));
  }

  get quantity(): BigInt {
    let value = this.get("quantity");
    return value.toBigInt();
  }

  set quantity(value: BigInt) {
    this.set("quantity", Value.fromBigInt(value));
  }

  get lastPurchasedAtTimestamp(): BigInt {
    let value = this.get("lastPurchasedAtTimestamp");
    return value.toBigInt();
  }

  set lastPurchasedAtTimestamp(value: BigInt) {
    this.set("lastPurchasedAtTimestamp", Value.fromBigInt(value));
  }
}
