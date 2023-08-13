// Relax some linter options:
//   * quote marks so "m/0'/1/2'/" doesn't need to be scaped
//   * too many tests, maxstatements -> 100
//   * store test vectors at the end, latedef: false
//   * should call is never defined

import _ from "bsv/util/_.js";
import chai from "chai";
import { describe, it } from "./testings.js";

chai.should();
import { expect } from "chai";
import sinon from "sinon";
import bsv from "bsv";
const Networks = bsv.Networks;
const HDPrivateKey = bsv.HDPrivateKey;
const HDPublicKey = bsv.HDPublicKey;

describe("HDKeys building with static methods", () => {
  const classes = [HDPublicKey, HDPrivateKey];

  _.each(classes, (Clazz) => {
    const expectStaticMethodFail = (staticMethod, argument, message) => {
      expect(Clazz[staticMethod].bind(null, argument)).to.throw(message);
    };
    it(`${Clazz.name} fromJSON checks that a valid JSON is provided`, () => {
      const errorMessage = "Invalid Argument: No valid argument was provided";
      const method = "fromObject";
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, "invalid JSON", errorMessage);
      expectStaticMethodFail(method, "{'singlequotes': true}", errorMessage);
    });
    it(`${Clazz.name} fromString checks that a string is provided`, () => {
      const errorMessage = "No valid string was provided";
      const method = "fromString";
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, {}, errorMessage);
    });
    it(`${Clazz.name} fromObject checks that an object is provided`, () => {
      const errorMessage = "No valid argument was provided";
      const method = "fromObject";
      expectStaticMethodFail(method, undefined, errorMessage);
      expectStaticMethodFail(method, null, errorMessage);
      expectStaticMethodFail(method, "", errorMessage);
    });
  });
});

describe("BIP32 compliance", () => {
  it("should initialize test vector 1 from the extended public key", () => {
    new HDPublicKey(vector1MPublic).xpubkey.should.equal(vector1MPublic);
  });

  it("should initialize test vector 1 from the extended private key", () => {
    new HDPrivateKey(vector1MPrivate).xprivkey.should.equal(vector1MPrivate);
  });

  it("can initialize a public key from an extended private key", () => {
    new HDPublicKey(vector1MPrivate).xpubkey.should.equal(vector1MPublic);
  });

  it("toString should be equal to the `xpubkey` member", () => {
    const privateKey = new HDPrivateKey(vector1MPrivate);
    privateKey.toString().should.equal(privateKey.xprivkey);
  });

  it("toString should be equal to the `xpubkey` member", () => {
    const publicKey = new HDPublicKey(vector1MPublic);
    publicKey.toString().should.equal(publicKey.xpubkey);
  });

  it("should get the extended public key from the extended private key for test vector 1", () => {
    HDPrivateKey(vector1MPrivate).xpubkey.should.equal(vector1MPublic);
  });

  it("should get m/0' ext. private key from test vector 1", () => {
    const privateKey = new HDPrivateKey(vector1MPrivate).deriveChild("m/0'");
    privateKey.xprivkey.should.equal(vector1m0hprivate);
  });

  it("should get m/0' ext. public key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'")
      .xpubkey.should.equal(vector1m0hPublic);
  });

  it("should get m/0'/1 ext. private key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1")
      .xprivkey.should.equal(vector1m0h1private);
  });

  it("should get m/0'/1 ext. public key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1")
      .xpubkey.should.equal(vector1m0h1public);
  });

  it("should get m/0'/1 ext. public key from m/0' public key from test vector 1", () => {
    const derivedPublic = HDPrivateKey(vector1MPrivate).deriveChild("m/0'")
      .hdPublicKey.deriveChild("m/1");
    derivedPublic.xpubkey.should.equal(vector1m0h1public);
  });

  it("should get m/0'/1/2' ext. private key from test vector 1", () => {
    const privateKey = new HDPrivateKey(vector1MPrivate);
    const derived = privateKey.deriveChild("m/0'/1/2'");
    derived.xprivkey.should.equal(vector1m0h12hprivate);
  });

  it("should get m/0'/1/2' ext. public key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'")
      .xpubkey.should.equal(vector1m0h12hpublic);
  });

  it("should get m/0'/1/2'/2 ext. private key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'/2")
      .xprivkey.should.equal(vector1m0h12h2private);
  });

  it("should get m/0'/1/2'/2 ext. public key from m/0'/1/2' public key from test vector 1", () => {
    const derived =
      HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'").hdPublicKey;
    derived.deriveChild("m/2").xpubkey.should.equal(vector1m0h12h2public);
  });

  it("should get m/0'/1/2h/2 ext. public key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'/2")
      .xpubkey.should.equal(vector1m0h12h2public);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. private key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'/2/1000000000")
      .xprivkey.should.equal(vector1m0h12h21000000000private);
  });

  it("should get m/0'/1/2h/2/1000000000 ext. public key from test vector 1", () => {
    HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'/2/1000000000")
      .xpubkey.should.equal(vector1m0h12h21000000000public);
  });

  it("should get m/0'/1/2'/2/1000000000 ext. public key from m/0'/1/2'/2 public key from test vector 1", () => {
    const derived =
      HDPrivateKey(vector1MPrivate).deriveChild("m/0'/1/2'/2").hdPublicKey;
    derived.deriveChild("m/1000000000").xpubkey.should.equal(
      vector1m0h12h21000000000public,
    );
  });

  it("should initialize test vector 2 from the extended public key", () => {
    HDPublicKey(vector2mpublic).xpubkey.should.equal(vector2mpublic);
  });

  it("should initialize test vector 2 from the extended private key", () => {
    HDPrivateKey(vector2mprivate).xprivkey.should.equal(vector2mprivate);
  });

  it("should get the extended public key from the extended private key for test vector 2", () => {
    HDPrivateKey(vector2mprivate).xpubkey.should.equal(vector2mpublic);
  });

  it("should get m/0 ext. private key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild(0).xprivkey.should.equal(
      vector2m0private,
    );
  });

  it("should get m/0 ext. public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild(0).xpubkey.should.equal(
      vector2m0public,
    );
  });

  it("should get m/0 ext. public key from m public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).hdPublicKey.deriveChild(0).xpubkey.should
      .equal(vector2m0public);
  });

  it("should get m/0/2147483647h ext. private key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'")
      .xprivkey.should.equal(vector2m02147483647hprivate);
  });

  it("should get m/0/2147483647h ext. public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'")
      .xpubkey.should.equal(vector2m02147483647hpublic);
  });

  it("should get m/0/2147483647h/1 ext. private key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1")
      .xprivkey.should.equal(vector2m02147483647h1private);
  });

  it("should get m/0/2147483647h/1 ext. public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1")
      .xpubkey.should.equal(vector2m02147483647h1public);
  });

  it("should get m/0/2147483647h/1 ext. public key from m/0/2147483647h public key from test vector 2", () => {
    const derived =
      HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'").hdPublicKey;
    derived.deriveChild(1).xpubkey.should.equal(vector2m02147483647h1public);
  });

  it("should get m/0/2147483647h/1/2147483646h ext. private key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1/2147483646'")
      .xprivkey.should.equal(vector2m02147483647h12147483646hprivate);
  });

  it("should get m/0/2147483647h/1/2147483646h ext. public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1/2147483646'")
      .xpubkey.should.equal(vector2m02147483647h12147483646hpublic);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. private key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1/2147483646'/2")
      .xprivkey.should.equal(vector2m02147483647h12147483646h2private);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. public key from test vector 2", () => {
    HDPrivateKey(vector2mprivate).deriveChild("m/0/2147483647'/1/2147483646'/2")
      .xpubkey.should.equal(vector2m02147483647h12147483646h2public);
  });

  it("should get m/0/2147483647h/1/2147483646h/2 ext. public key from m/0/2147483647h/2147483646h public key from test vector 2", () => {
    const derivedPublic = HDPrivateKey(vector2mprivate)
      .deriveChild("m/0/2147483647'/1/2147483646'").hdPublicKey;
    derivedPublic.deriveChild("m/2")
      .xpubkey.should.equal(vector2m02147483647h12147483646h2public);
  });

  it("should use full 32 bytes for private key data that is hashed (as per bip32)", () => {
    // https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
    const privateKeyBuffer = Buffer.from(
      "00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd",
      "hex",
    );
    const chainCodeBuffer = Buffer.from(
      "9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089",
      "hex",
    );
    const key = HDPrivateKey.fromObject({
      network: "testnet",
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    const derived = key.deriveChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toHex().should.equal(
      "3348069561d2a0fb925e74bf198762acc47dce7db27372257d2d959a9e6f8aeb",
    );
  });

  it("should NOT use full 32 bytes for private key data that is hashed with nonCompliant flag", () => {
    // This is to test that the previously implemented non-compliant to BIP32
    const privateKeyBuffer = Buffer.from(
      "00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd",
      "hex",
    );
    const chainCodeBuffer = Buffer.from(
      "9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089",
      "hex",
    );
    const key = HDPrivateKey.fromObject({
      network: "testnet",
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    const derived = key.deriveNonCompliantChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toHex().should.equal(
      "4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836",
    );
  });

  it("should NOT use full 32 bytes for private key data that is hashed with the nonCompliant derive method", () => {
    // This is to test that the previously implemented non-compliant to BIP32
    const privateKeyBuffer = Buffer.from(
      "00000055378cf5fafb56c711c674143f9b0ee82ab0ba2924f19b64f5ae7cdbfd",
      "hex",
    );
    const chainCodeBuffer = Buffer.from(
      "9c8a5c863e5941f3d99453e6ba66b328bb17cf0b8dec89ed4fc5ace397a1c089",
      "hex",
    );
    const key = HDPrivateKey.fromObject({
      network: "testnet",
      depth: 0,
      parentFingerPrint: 0,
      childIndex: 0,
      privateKey: privateKeyBuffer,
      chainCode: chainCodeBuffer,
    });
    const derived = key.deriveNonCompliantChild("m/44'/0'/0'/0/0'");
    derived.privateKey.toHex().should.equal(
      "4811a079bab267bfdca855b3bddff20231ff7044e648514fa099158472df2836",
    );
  });

  describe("edge cases", () => {
    const sandbox = sinon.createSandbox();
    afterEach(() => {
      sandbox.restore();
    });
    it("will handle edge case that derived private key is invalid", () => {
      const invalid = Buffer.from(
        "0000000000000000000000000000000000000000000000000000000000000000",
        "hex",
      );
      const privateKeyBuffer = Buffer.from(
        "5f72914c48581fc7ddeb944a9616389200a9560177d24f458258e5b04527bcd1",
        "hex",
      );
      const chainCodeBuffer = Buffer.from(
        "39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91",
        "hex",
      );
      const unstubbed = bsv.crypto.BN.prototype.toBuffer;
      let count = 0;
      sandbox.stub(bsv.crypto.BN.prototype, "toBuffer").callsFake(
        function (args) {
          // On the fourth call to the function give back an invalid private key
          // otherwise use the normal behavior.
          count++;
          if (count === 4) {
            return invalid;
          }
          const ret = unstubbed.apply(this, arguments);
          return ret;
        },
      );
      sandbox.spy(bsv.PrivateKey, "isValid");
      const key = HDPrivateKey.fromObject({
        network: "testnet",
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        privateKey: privateKeyBuffer,
        chainCode: chainCodeBuffer,
      });
      const derived = key.deriveChild("m/44'");
      derived.privateKey.toHex().should.equal(
        "b15bce3608d607ee3a49069197732c656bca942ee59f3e29b4d56914c1de6825",
      );
      bsv.PrivateKey.isValid.callCount.should.equal(2);
    });
    it("will handle edge case that a derive public key is invalid", () => {
      const publicKeyBuffer = Buffer.from(
        "029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099",
        "hex",
      );
      const chainCodeBuffer = Buffer.from(
        "39816057bba9d952fe87fe998b7fd4d690a1bb58c2ff69141469e4d1dffb4b91",
        "hex",
      );
      const key = new HDPublicKey({
        network: "testnet",
        depth: 0,
        parentFingerPrint: 0,
        childIndex: 0,
        chainCode: chainCodeBuffer,
        publicKey: publicKeyBuffer,
      });
      const unstubbed = bsv.PublicKey.fromPoint;
      bsv.PublicKey.fromPoint = () => {
        bsv.PublicKey.fromPoint = unstubbed;
        throw new Error("Point cannot be equal to Infinity");
      };
      sandbox.spy(key, "_deriveWithNumber");
      key.deriveChild("m/44");
      key._deriveWithNumber.callCount.should.equal(2);
      key.publicKey.toString().should.equal(
        "029e58b241790284ef56502667b15157b3fc58c567f044ddc35653860f9455d099",
      );
    });
  });

  describe("seed", () => {
    it("should initialize a new BIP32 correctly from test vector 1 seed", () => {
      const seededKey = HDPrivateKey.fromSeed(vector1Master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector1MPrivate);
      seededKey.xpubkey.should.equal(vector1MPublic);
    });

    it("should initialize a new BIP32 correctly from test vector 2 seed", () => {
      const seededKey = HDPrivateKey.fromSeed(vector2master, Networks.livenet);
      seededKey.xprivkey.should.equal(vector2mprivate);
      seededKey.xpubkey.should.equal(vector2mpublic);
    });
  });
});

// test vectors: https://github.com/bitcoin/bips/blob/master/bip-0032.mediawiki
var vector1Master = "000102030405060708090a0b0c0d0e0f";
var vector1MPublic =
  "xpub661MyMwAqRbcFtXgS5sYJABqqG9YLmC4Q1Rdap9gSE8NqtwybGhePY2gZ29ESFjqJoCu1Rupje8YtGqsefD265TMg7usUDFdp6W1EGMcet8";
var vector1MPrivate =
  "xprv9s21ZrQH143K3QTDL4LXw2F7HEK3wJUD2nW2nRk4stbPy6cq3jPPqjiChkVvvNKmPGJxWUtg6LnF5kejMRNNU3TGtRBeJgk33yuGBxrMPHi";
var vector1m0hPublic =
  "xpub68Gmy5EdvgibQVfPdqkBBCHxA5htiqg55crXYuXoQRKfDBFA1WEjWgP6LHhwBZeNK1VTsfTFUHCdrfp1bgwQ9xv5ski8PX9rL2dZXvgGDnw";
var vector1m0hprivate =
  "xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7";
var vector1m0h1public =
  "xpub6ASuArnXKPbfEwhqN6e3mwBcDTgzisQN1wXN9BJcM47sSikHjJf3UFHKkNAWbWMiGj7Wf5uMash7SyYq527Hqck2AxYysAA7xmALppuCkwQ";
var vector1m0h1private =
  "xprv9wTYmMFdV23N2TdNG573QoEsfRrWKQgWeibmLntzniatZvR9BmLnvSxqu53Kw1UmYPxLgboyZQaXwTCg8MSY3H2EU4pWcQDnRnrVA1xe8fs";
var vector1m0h12hpublic =
  "xpub6D4BDPcP2GT577Vvch3R8wDkScZWzQzMMUm3PWbmWvVJrZwQY4VUNgqFJPMM3No2dFDFGTsxxpG5uJh7n7epu4trkrX7x7DogT5Uv6fcLW5";
var vector1m0h12hprivate =
  "xprv9z4pot5VBttmtdRTWfWQmoH1taj2axGVzFqSb8C9xaxKymcFzXBDptWmT7FwuEzG3ryjH4ktypQSAewRiNMjANTtpgP4mLTj34bhnZX7UiM";
var vector1m0h12h2public =
  "xpub6FHa3pjLCk84BayeJxFW2SP4XRrFd1JYnxeLeU8EqN3vDfZmbqBqaGJAyiLjTAwm6ZLRQUMv1ZACTj37sR62cfN7fe5JnJ7dh8zL4fiyLHV";
var vector1m0h12h2private =
  "xprvA2JDeKCSNNZky6uBCviVfJSKyQ1mDYahRjijr5idH2WwLsEd4Hsb2Tyh8RfQMuPh7f7RtyzTtdrbdqqsunu5Mm3wDvUAKRHSC34sJ7in334";
var vector1m0h12h21000000000public =
  "xpub6H1LXWLaKsWFhvm6RVpEL9P4KfRZSW7abD2ttkWP3SSQvnyA8FSVqNTEcYFgJS2UaFcxupHiYkro49S8yGasTvXEYBVPamhGW6cFJodrTHy";
var vector1m0h12h21000000000private =
  "xprvA41z7zogVVwxVSgdKUHDy1SKmdb533PjDz7J6N6mV6uS3ze1ai8FHa8kmHScGpWmj4WggLyQjgPie1rFSruoUihUZREPSL39UNdE3BBDu76";
var vector2master =
  "fffcf9f6f3f0edeae7e4e1dedbd8d5d2cfccc9c6c3c0bdbab7b4b1aeaba8a5a29f9c999693908d8a8784817e7b7875726f6c696663605d5a5754514e4b484542";
var vector2mpublic =
  "xpub661MyMwAqRbcFW31YEwpkMuc5THy2PSt5bDMsktWQcFF8syAmRUapSCGu8ED9W6oDMSgv6Zz8idoc4a6mr8BDzTJY47LJhkJ8UB7WEGuduB";
var vector2mprivate =
  "xprv9s21ZrQH143K31xYSDQpPDxsXRTUcvj2iNHm5NUtrGiGG5e2DtALGdso3pGz6ssrdK4PFmM8NSpSBHNqPqm55Qn3LqFtT2emdEXVYsCzC2U";
var vector2m0public =
  "xpub69H7F5d8KSRgmmdJg2KhpAK8SR3DjMwAdkxj3ZuxV27CprR9LgpeyGmXUbC6wb7ERfvrnKZjXoUmmDznezpbZb7ap6r1D3tgFxHmwMkQTPH";
var vector2m0private =
  "xprv9vHkqa6EV4sPZHYqZznhT2NPtPCjKuDKGY38FBWLvgaDx45zo9WQRUT3dKYnjwih2yJD9mkrocEZXo1ex8G81dwSM1fwqWpWkeS3v86pgKt";
var vector2m02147483647hpublic =
  "xpub6ASAVgeehLbnwdqV6UKMHVzgqAG8Gr6riv3Fxxpj8ksbH9ebxaEyBLZ85ySDhKiLDBrQSARLq1uNRts8RuJiHjaDMBU4Zn9h8LZNnBC5y4a";
var vector2m02147483647hprivate =
  "xprv9wSp6B7kry3Vj9m1zSnLvN3xH8RdsPP1Mh7fAaR7aRLcQMKTR2vidYEeEg2mUCTAwCd6vnxVrcjfy2kRgVsFawNzmjuHc2YmYRmagcEPdU9";
var vector2m02147483647h1public =
  "xpub6DF8uhdarytz3FWdA8TvFSvvAh8dP3283MY7p2V4SeE2wyWmG5mg5EwVvmdMVCQcoNJxGoWaU9DCWh89LojfZ537wTfunKau47EL2dhHKon";
var vector2m02147483647h1private =
  "xprv9zFnWC6h2cLgpmSA46vutJzBcfJ8yaJGg8cX1e5StJh45BBciYTRXSd25UEPVuesF9yog62tGAQtHjXajPPdbRCHuWS6T8XA2ECKADdw4Ef";
var vector2m02147483647h12147483646hpublic =
  "xpub6ERApfZwUNrhLCkDtcHTcxd75RbzS1ed54G1LkBUHQVHQKqhMkhgbmJbZRkrgZw4koxb5JaHWkY4ALHY2grBGRjaDMzQLcgJvLJuZZvRcEL";
var vector2m02147483647h12147483646hprivate =
  "xprvA1RpRA33e1JQ7ifknakTFpgNXPmW2YvmhqLQYMmrj4xJXXWYpDPS3xz7iAxn8L39njGVyuoseXzU6rcxFLJ8HFsTjSyQbLYnMpCqE2VbFWc";
var vector2m02147483647h12147483646h2public =
  "xpub6FnCn6nSzZAw5Tw7cgR9bi15UV96gLZhjDstkXXxvCLsUXBGXPdSnLFbdpq8p9HmGsApME5hQTZ3emM2rnY5agb9rXpVGyy3bdW6EEgAtqt";
var vector2m02147483647h12147483646h2private =
  "xprvA2nrNbFZABcdryreWet9Ea4LvTJcGsqrMzxHx98MMrotbir7yrKCEXw7nadnHM8Dq38EGfSh6dqA9QWTyefMLEcBYJUuekgW4BYPJcr9E7j";