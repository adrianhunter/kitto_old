import assert from "assert";
await import("chai").should();
import { expect } from "chai";
import bsv from "bsv";
import { Buffer } from "buffer";
const errors = bsv.errors;
const hdErrors = bsv.errors.HDPublicKey;
import { integerAsBuffer } from "bsv/util/js.js";
const HDPrivateKey = bsv.HDPrivateKey;
const HDPublicKey = bsv.HDPublicKey;
const Base58Check = bsv.encoding.Base58Check;
const Networks = bsv.Networks;

const xprivkey =
  "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi";
const xpubkey =
  "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8";
const xpubkeyTestnet =
  "tpubD6NzVbkrYhZ4WZaiWHz59q5EQ61bd6dUYfU4ggRWAtNAyyYRNWT6ktJ7UHJEXURvTfTfskFQmK7Ff4FRkiRN5wQH8nkGAb6aKB4Yyeqsw5m";
const json =
  '{"network":"livenet","depth":0,"fingerPrint":876747070,"parentFingerPrint":0,"childIndex":0,"chainCode":"873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508","publicKey":"0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2","checksum":2873572129,"xpubkey":"xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8"}';
const derived01200000 =
  "xpub6BqyndF6rkBNTV6LXwiY8Pco8aqctqq7tGEUdA8fmGDTnDJphn2fmxr3eM8Lm3m8TrNUsLbEjHvpa3adBU18YpEx4tp2Zp6nqax3mQkudhX";

describe("HDPublicKey interface", () => {
  const expectFail = (func, errorType) => {
    (() => {
      func();
    }).should.throw(errorType);
  };

  const expectDerivationFail = (argument, error) => {
    (() => {
      const pubkey = new HDPublicKey(xpubkey);
      pubkey.deriveChild(argument);
    }).should.throw(error);
  };

  const expectFailBuilding = (argument, error) => {
    (() => new HDPublicKey(argument)).should.throw(error);
  };

  describe("creation formats", () => {
    it("returns same argument if already an instance of HDPublicKey", () => {
      const publicKey = new HDPublicKey(xpubkey);
      publicKey.should.equal(new HDPublicKey(publicKey));
    });

    it("returns the correct xpubkey for a xprivkey", () => {
      const publicKey = new HDPublicKey(xprivkey);
      publicKey.xpubkey.should.equal(xpubkey);
    });

    it('allows to call the argument with no "new" keyword', () => {
      HDPublicKey(xpubkey).xpubkey.should.equal(
        new HDPublicKey(xpubkey).xpubkey,
      );
    });

    it("fails when user doesn't supply an argument", () => {
      expectFailBuilding(null, hdErrors.MustSupplyArgument);
    });

    it("should not be able to change read-only properties", () => {
      const publicKey = new HDPublicKey(xprivkey);
      expect(() => {
        publicKey.fingerPrint = "notafingerprint";
      }).to.throw(TypeError);
    });

    it("doesn't recognize an invalid argument", () => {
      expectFailBuilding(1, hdErrors.UnrecognizedArgument);
      expectFailBuilding(true, hdErrors.UnrecognizedArgument);
    });

    describe("xpubkey string serialization errors", () => {
      it("fails on invalid length", () => {
        expectFailBuilding(
          Base58Check.encode(buffer.Buffer.from([1, 2, 3])),
          hdErrors.InvalidLength,
        );
      });
      it("fails on invalid base58 encoding", () => {
        expectFailBuilding(
          `${xpubkey}1`,
          errors.InvalidB58Checksum,
        );
      });
      it("user can ask if a string is valid", () => {
        (HDPublicKey.isValidSerialized(xpubkey)).should.equal(true);
      });
    });

    it("can be generated from a json", () => {
      expect(new HDPublicKey(JSON.parse(json)).xpubkey).to.equal(xpubkey);
    });

    it("can generate a json that has a particular structure", () => {
      assert.deepStrictEqual(
        new HDPublicKey(JSON.parse(json)).toJSON(),
        new HDPublicKey(xpubkey).toJSON(),
      );
    });

    it("builds from a buffer object", () => {
      (new HDPublicKey(new HDPublicKey(xpubkey)._buffers)).xpubkey.should.equal(
        xpubkey,
      );
    });

    it("checks the checksum", () => {
      const buffers = new HDPublicKey(xpubkey)._buffers;
      buffers.checksum = integerAsBuffer(1);
      expectFail(() => new HDPublicKey(buffers), errors.InvalidB58Checksum);
    });
  });

  describe("error checking on serialization", () => {
    const compareType = (a, b) => {
      expect(a instanceof b).to.equal(true);
    };
    it("throws invalid argument when argument is not a string or buffer", () => {
      compareType(
        HDPublicKey.getSerializedError(1),
        hdErrors.UnrecognizedArgument,
      );
    });
    it("if a network is provided, validates that data corresponds to it", () => {
      compareType(
        HDPublicKey.getSerializedError(xpubkey, "testnet"),
        errors.InvalidNetwork,
      );
    });
    it("recognizes invalid network arguments", () => {
      compareType(
        HDPublicKey.getSerializedError(xpubkey, "invalid"),
        errors.InvalidNetworkArgument,
      );
    });
    it("recognizes a valid network", () => {
      expect(HDPublicKey.getSerializedError(xpubkey, "livenet")).to.equal(null);
    });
  });

  it("toString() returns the same value as .xpubkey", () => {
    const pubKey = new HDPublicKey(xpubkey);
    pubKey.toString().should.equal(pubKey.xpubkey);
  });

  it("publicKey property matches network", () => {
    const livenet = new HDPublicKey(xpubkey);
    const testnet = new HDPublicKey(xpubkeyTestnet);

    livenet.publicKey.network.should.equal(Networks.livenet);
    testnet.publicKey.network.should.equal(Networks.testnet);
  });

  it("inspect() displays correctly", () => {
    const pubKey = new HDPublicKey(xpubkey);
    pubKey.inspect().should.equal(`<HDPublicKey: ${pubKey.xpubkey}>`);
  });

  describe("conversion to/from buffer", () => {
    it("should roundtrip to an equivalent object", () => {
      const pubKey = new HDPublicKey(xpubkey);
      const toBuffer = pubKey.toBuffer();
      const fromBuffer = HDPublicKey.fromBuffer(toBuffer);
      const roundTrip = new HDPublicKey(fromBuffer.toBuffer());
      roundTrip.xpubkey.should.equal(xpubkey);
    });
  });

  describe("conversion to/from hex", () => {
    it("should roundtrip to an equivalent object", () => {
      const pubKey = new HDPublicKey(xpubkey);
      const toHex = pubKey.toHex();
      const fromHex = HDPublicKey.fromHex(toHex);
      const roundTrip = new HDPublicKey(fromHex.toBuffer());
      roundTrip.xpubkey.should.equal(xpubkey);
    });
  });

  describe("from hdprivatekey", () => {
    const str =
      "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi";
    it("should roundtrip to/from a buffer", () => {
      const xprv1 = new HDPrivateKey(str);
      const xprv2 = HDPrivateKey.fromRandom();
      const xprv3 = HDPrivateKey.fromRandom();
      const xpub1 = HDPublicKey.fromHDPrivateKey(xprv1);
      const xpub2 = HDPublicKey.fromHDPrivateKey(xprv2);
      const xpub3 = HDPublicKey.fromHDPrivateKey(xprv3);
      xpub1.toString().should.equal(
        "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
      );
      xpub1.toString().should.not.equal(xpub2.toString());
      xpub1.toString().should.not.equal(xpub3.toString());
    });
  });

  describe("conversion to different formats", () => {
    const plainObject = {
      "network": "livenet",
      "depth": 0,
      "fingerPrint": 876747070,
      "parentFingerPrint": 0,
      "childIndex": 0,
      "chainCode":
        "873dff81c02f525623fd1fe5167eac3a55a049de3d314bb42ee227ffed37d508",
      "publicKey":
        "0339a36013301597daef41fbe593a02cc513d0b55527ec2df1050e2e8ff49c85c2",
      "checksum": 2873572129,
      "xpubkey":
        "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8",
    };
    it("roundtrips to JSON and to Object", () => {
      const pubkey = new HDPublicKey(xpubkey);
      expect(HDPublicKey.fromObject(pubkey.toJSON()).xpubkey).to.equal(xpubkey);
    });
    it("recovers state from Object", () => {
      new HDPublicKey(plainObject).xpubkey.should.equal(xpubkey);
    });
  });

  describe("derivation", () => {
    it("derivation is the same whether deriving with number or string", () => {
      const pubkey = new HDPublicKey(xpubkey);
      const derived1 = pubkey.deriveChild(0).deriveChild(1).deriveChild(200000);
      const derived2 = pubkey.deriveChild("m/0/1/200000");
      derived1.xpubkey.should.equal(derived01200000);
      derived2.xpubkey.should.equal(derived01200000);
    });

    it("allows special parameters m, M", () => {
      const expectDerivationSuccess = (argument) => {
        new HDPublicKey(xpubkey).deriveChild(argument).xpubkey.should.equal(
          xpubkey,
        );
      };
      expectDerivationSuccess("m");
      expectDerivationSuccess("M");
    });

    it("doesn't allow object arguments for derivation", () => {
      expectFail(
        () => new HDPublicKey(xpubkey).deriveChild({}),
        hdErrors.InvalidDerivationArgument,
      );
    });

    it("needs first argument for derivation", () => {
      expectFail(
        () => new HDPublicKey(xpubkey).deriveChild("s"),
        hdErrors.InvalidPath,
      );
    });

    it("doesn't allow other parameters like m' or M' or \"s\"", () => {
      expectDerivationFail("m'", hdErrors.InvalidIndexCantDeriveHardened);
      expectDerivationFail("M'", hdErrors.InvalidIndexCantDeriveHardened);
      expectDerivationFail("1", hdErrors.InvalidPath);
      expectDerivationFail("S", hdErrors.InvalidPath);
    });

    it("can't derive hardened keys", () => {
      expectFail(
        () => new HDPublicKey(xpubkey).deriveChild(HDPublicKey.Hardened),
        hdErrors.InvalidIndexCantDeriveHardened,
      );
    });

    it("can't derive hardened keys via second argument", () => {
      expectFail(
        () => new HDPublicKey(xpubkey).deriveChild(5, true),
        hdErrors.InvalidIndexCantDeriveHardened,
      );
    });

    it("validates correct paths", () => {
      let valid;

      valid = HDPublicKey.isValidPath("m/123/12");
      valid.should.equal(true);

      valid = HDPublicKey.isValidPath("m");
      valid.should.equal(true);

      valid = HDPublicKey.isValidPath(123);
      valid.should.equal(true);
    });

    it("rejects illegal paths", () => {
      let valid;

      valid = HDPublicKey.isValidPath("m/-1/12");
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath("m/0'/12");
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath("m/8000000000/12");
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath("bad path");
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath(-1);
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath(8000000000);
      valid.should.equal(false);

      valid = HDPublicKey.isValidPath(HDPublicKey.Hardened);
      valid.should.equal(false);
    });
  });
});
