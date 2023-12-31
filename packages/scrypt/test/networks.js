import { expect, should as ss } from "chai";
import { describe, it } from "./testings.js";
import { Buffer } from "buffer";
const should = ss();
import bsv from "bsv";
const networks = bsv.Networks;

describe("Networks", () => {
  let customnet;

  it("should contain all Networks", () => {
    should.exist(networks.livenet);
    should.exist(networks.testnet);
    should.exist(networks.stn);
    should.exist(networks.defaultNetwork);
  });

  it("should be able to define a custom Network", () => {
    const custom = {
      name: "customnet",
      alias: "mynet",
      pubkeyhash: 0x10,
      privatekey: 0x90,
      scripthash: 0x08,
      xpubkey: 0x0278b20e,
      xprivkey: 0x0278ade4,
      networkMagic: 0xe7beb4d4,
      port: 20001,
      dnsSeeds: [
        "localhost",
        "mynet.localhost",
      ],
    };
    networks.add(custom);
    customnet = networks.get("customnet");
    for (const key in custom) {
      if (key !== "networkMagic") {
        customnet[key].should.equal(custom[key]);
      } else {
        const expected = Buffer.from("e7beb4d4", "hex");
        customnet[key].should.deep.equal(expected);
      }
    }
  });

  it("should have network magic for testnet", () => {
    const testnet = networks.get("testnet");
    Buffer.isBuffer(testnet.networkMagic).should.equal(true);
  });

  it("should have network magic for stn", () => {
    const stn = networks.get("stn");
    Buffer.isBuffer(stn.networkMagic).should.equal(true);
  });

  it("can remove a custom network", () => {
    networks.remove(customnet);
    const net = networks.get("customnet");
    should.equal(net, undefined);
  });

  it("should not set a network map for an undefined value", () => {
    const custom = {
      name: "somenet",
      pubkeyhash: 0x13,
      privatekey: 0x93,
      scripthash: 0x11,
      xpubkey: 0x0278b20f,
      xprivkey: 0x0278ade5,
      networkMagic: 0xe7beb4d5,
      port: 20008,
      dnsSeeds: [
        "somenet.localhost",
      ],
    };
    networks.add(custom);
    const network = networks.get(undefined);
    should.not.exist(network);
    const somenet = networks.get("somenet");
    should.exist(somenet);
    somenet.name.should.equal("somenet");
    networks.remove(somenet);
  });

  const constants = [
    "name",
    "alias",
    "pubkeyhash",
    "scripthash",
    "xpubkey",
    "xprivkey",
  ];

  constants.forEach((key) => {
    it(`should have constant ${key} for livenet, testnet and stn`, () => {
      networks.testnet.hasOwnProperty(key).should.equal(true);
      networks.livenet.hasOwnProperty(key).should.equal(true);
      networks.stn.hasOwnProperty(key).should.equal(true);
    });
  });

  it("tests only for the specified key", () => {
    expect(networks.get(0x6f, "pubkeyhash")).to.equal(networks.testnet);
    expect(networks.get(0x6f, "privatekey")).to.equal(undefined);
  });

  it("can test for multiple keys", () => {
    expect(networks.get(0x6f, ["pubkeyhash", "scripthash"])).to.equal(
      networks.testnet,
    );
    expect(networks.get(0xc4, ["pubkeyhash", "scripthash"])).to.equal(
      networks.testnet,
    );
    expect(networks.get(0x6f, ["privatekey", "port"])).to.equal(undefined);
  });

  it("should have regtest network", () => {
    expect(networks.get("regtest").name).to.equal("regtest");
  });

  it("should have testnet network", () => {
    expect(networks.get("testnet").name).to.equal("testnet");
  });

  it("should have stn network", () => {
    expect(networks.get("stn").name).to.equal("stn");
  });

  it("should have livenet network", () => {
    expect(networks.get("livenet").name).to.equal("livenet");
  });

  it("should have bchtest cashAddrPrefix", () => {
    expect(networks.get("testnet").cashAddrPrefix).to.equal("bchtest");
  });

  it("should have bchreg cashAddrPrefix", () => {
    expect(networks.get("regtest").cashAddrPrefix).to.equal("bchreg");
  });

  it("should have bchreg cashAddrPrefix after enableRegtest is called", () => {
    const network = networks.get("testnet");
    networks.enableRegtest();
    expect(network.cashAddrPrefix).to.equal("bchreg");
  });

  it("should have bchtest cashAddrPrefix after disableRegtest is called", () => {
    const network = networks.get("testnet");
    networks.disableRegtest();
    expect(network.cashAddrPrefix).to.equal("bchtest");
  });
  it("should have bsvstn cashAddrPrefix after enableStn is called", () => {
    const network = networks.get("testnet");
    networks.enableStn();
    expect(network.cashAddrPrefix).to.equal("bsvstn");
  });

  it("should have bchtest cashAddrPrefix after disableStn is called", () => {
    const network = networks.get("testnet");
    networks.disableStn();
    expect(network.cashAddrPrefix).to.equal("bchtest");
  });

  it('converts to string using the "name" property', () => {
    networks.livenet.toString().should.equal("livenet");
  });

  it("network object should be immutable", () => {
    expect(networks.testnet.name).to.equal("testnet");
    const fn = () => {
      networks.testnet.name = "livenet";
    };
    expect(fn).to.throw(TypeError);
  });
});
