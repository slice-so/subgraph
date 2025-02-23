// THIS IS AN AUTOGENERATED FILE. DO NOT EDIT THIS FILE DIRECTLY.

import {
  Address,
  DataSourceTemplate,
  DataSourceContext,
} from "@graphprotocol/graph-ts";

export class Slicer extends DataSourceTemplate {
  static create(address: Address): void {
    DataSourceTemplate.create("Slicer", [address.toHex()]);
  }

  static createWithContext(address: Address, context: DataSourceContext): void {
    DataSourceTemplate.createWithContext("Slicer", [address.toHex()], context);
  }
}
