import BlockHeader from "bsv/block/blockheader.js";
import BN from "bsv/crypto/bn.js";
const BufferReader = "bsv/encoding/bufferreader.js";
const BufferWriter = "bsv/encoding/bufferwriter.js";
import chai from "chai";
const should = chai.should();

// https://test-insight.bitpay.com/block/000000000b99b16390660d79fcc138d2ad0c89a0d044c4201a02bdf1f61ffa11
const dataRawBlockBuffer = await fetch(
  new URL("./data/blk86756-testnet.dat", import.meta.url),
).then(
  async (a) => new Uint8Array(await a.arrayBuffer()),
);
const dataRawBlockBinary = await fetch(
  new URL("./data/blk86756-testnet.dat", import.meta.url),
).then(
  async (a) => new Uint8Array(await a.arrayBuffer()),
);
const dataRawId =
  "000000000b99b16390660d79fcc138d2ad0c89a0d044c4201a02bdf1f61ffa11";
import data from "data/blk86756-testnet.js";

describe("BlockHeader", () => {
  const version = data.version;
  const prevblockidbuf = Buffer.from(data.prevblockidhex, "hex");
  const merklerootbuf = Buffer.from(data.merkleroothex, "hex");
  const time = data.time;
  const bits = data.bits;
  const nonce = data.nonce;
  const bh = new BlockHeader({
    version,
    prevHash: prevblockidbuf,
    merkleRoot: merklerootbuf,
    time,
    bits,
    nonce,
  });
  const bhhex = data.blockheaderhex;
  const bhbuf = Buffer.from(bhhex, "hex");

  it("should make a new blockheader", () => {
    BlockHeader(bhbuf).toBuffer().toString("hex").should.equal(bhhex);
  });

  it("should not make an empty block", () => {
    (() => {
      BlockHeader();
    }).should.throw("Unrecognized argument for BlockHeader");
  });

  describe("#constructor", () => {
    it("should set all the variables", () => {
      const bh = new BlockHeader({
        version,
        prevHash: prevblockidbuf,
        merkleRoot: merklerootbuf,
        time,
        bits,
        nonce,
      });
      should.exist(bh.version);
      should.exist(bh.prevHash);
      should.exist(bh.merkleRoot);
      should.exist(bh.time);
      should.exist(bh.bits);
      should.exist(bh.nonce);
    });

    it("will throw an error if the argument object hash property doesn't match", () => {
      (() => {
        new BlockHeader({ //eslint-disable-line
          hash:
            "000000000019d6689c085ae165831e934ff763ae46a2a6c172b3f1b60a8ce26f",
          version,
          prevHash: prevblockidbuf,
          merkleRoot: merklerootbuf,
          time,
          bits,
          nonce,
        });
      }).should.throw(
        "Argument object hash property does not match block hash.",
      );
    });
  });

  describe("version", () => {
    it("is interpreted as an int32le", () => {
      const hex =
        "ffffffff00000000000000000000000000000000000000000000000000000000000000004141414141414141414141414141414141414141414141414141414141414141010000000200000003000000";
      const header = BlockHeader.fromBuffer(Buffer.from(hex, "hex"));
      header.version.should.equal(-1);
      header.timestamp.should.equal(1);
    });
  });

  describe("#fromObject", () => {
    it("should set all the variables", () => {
      const bh = BlockHeader.fromObject({
        version,
        prevHash: prevblockidbuf.toString("hex"),
        merkleRoot: merklerootbuf.toString("hex"),
        time,
        bits,
        nonce,
      });
      should.exist(bh.version);
      should.exist(bh.prevHash);
      should.exist(bh.merkleRoot);
      should.exist(bh.time);
      should.exist(bh.bits);
      should.exist(bh.nonce);
    });
  });

  describe("#toJSON", () => {
    it("should set all the variables", () => {
      const json = bh.toJSON();
      should.exist(json.version);
      should.exist(json.prevHash);
      should.exist(json.merkleRoot);
      should.exist(json.time);
      should.exist(json.bits);
      should.exist(json.nonce);
    });
  });

  describe("#fromJSON", () => {
    it("should parse this known json string", () => {
      const jsonString = JSON.stringify({
        version,
        prevHash: prevblockidbuf,
        merkleRoot: merklerootbuf,
        time,
        bits,
        nonce,
      });

      const json = new BlockHeader(JSON.parse(jsonString));
      should.exist(json.version);
      should.exist(json.prevHash);
      should.exist(json.merkleRoot);
      should.exist(json.time);
      should.exist(json.bits);
      should.exist(json.nonce);
    });
  });

  describe("#fromString/#toString", () => {
    it("should output/input a block hex string", () => {
      const b = BlockHeader.fromString(bhhex);
      b.toString().should.equal(bhhex);
    });
  });

  describe("#fromBuffer", () => {
    it("should parse this known buffer", () => {
      BlockHeader.fromBuffer(bhbuf).toBuffer().toString("hex").should.equal(
        bhhex,
      );
    });
  });

  describe("#fromBufferReader", () => {
    it("should parse this known buffer", () => {
      BlockHeader.fromBufferReader(BufferReader(bhbuf)).toBuffer().toString(
        "hex",
      ).should.equal(bhhex);
    });
  });

  describe("#toBuffer", () => {
    it("should output this known buffer", () => {
      BlockHeader.fromBuffer(bhbuf).toBuffer().toString("hex").should.equal(
        bhhex,
      );
    });
  });

  describe("#toBufferWriter", () => {
    it("should output this known buffer", () => {
      BlockHeader.fromBuffer(bhbuf).toBufferWriter().concat().toString("hex")
        .should.equal(bhhex);
    });

    it("doesn't create a bufferWriter if one provided", () => {
      const writer = new BufferWriter();
      const blockHeader = BlockHeader.fromBuffer(bhbuf);
      blockHeader.toBufferWriter(writer).should.equal(writer);
    });
  });

  describe("#inspect", () => {
    it("should return the correct inspect of the genesis block", () => {
      const block = BlockHeader.fromRawBlock(dataRawBlockBinary);
      block.inspect().should.equal(`<BlockHeader ${dataRawId}>`);
    });
  });

  describe("#fromRawBlock", () => {
    it("should instantiate from a raw block binary", () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBinary);
      x.version.should.equal(2);
      new BN(x.bits).toString("hex").should.equal("1c3fffc0");
    });

    it("should instantiate from raw block buffer", () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer);
      x.version.should.equal(2);
      new BN(x.bits).toString("hex").should.equal("1c3fffc0");
    });
  });

  describe("#validTimestamp", () => {
    const x = BlockHeader.fromRawBlock(dataRawBlockBuffer);

    it("should validate timpstamp as true", () => {
      const valid = x.validTimestamp(x);
      valid.should.equal(true);
    });

    it("should validate timestamp as false", () => {
      x.time = Math.round(new Date().getTime() / 1000) +
        BlockHeader.Constants.MAX_TIME_OFFSET + 100;
      const valid = x.validTimestamp(x);
      valid.should.equal(false);
    });
  });

  describe("#validProofOfWork", () => {
    it("should validate proof-of-work as true", () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer);
      const valid = x.validProofOfWork(x);
      valid.should.equal(true);
    });

    it("should validate proof of work as false because incorrect proof of work", () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer);
      const nonce = x.nonce;
      x.nonce = 0;
      const valid = x.validProofOfWork(x);
      valid.should.equal(false);
      x.nonce = nonce;
    });
  });

  describe("#getDifficulty", () => {
    it("should get the correct difficulty for block 86756", () => {
      const x = BlockHeader.fromRawBlock(dataRawBlockBuffer);
      x.bits.should.equal(0x1c3fffc0);
      x.getDifficulty().should.equal(4);
    });

    it("should get the correct difficulty for testnet block 552065", () => {
      const x = new BlockHeader({
        bits: 0x1b00c2a8,
      });
      x.getDifficulty().should.equal(86187.62562209);
    });

    it("should get the correct difficulty for livenet block 373043", () => {
      const x = new BlockHeader({
        bits: 0x18134dc1,
      });
      x.getDifficulty().should.equal(56957648455.01001);
    });

    it("should get the correct difficulty for livenet block 340000", () => {
      const x = new BlockHeader({
        bits: 0x1819012f,
      });
      x.getDifficulty().should.equal(43971662056.08958);
    });

    it("should use exponent notation if difficulty is larger than Javascript number", () => {
      const x = new BlockHeader({
        bits: 0x0900c2a8,
      });
      x.getDifficulty().should.equal(1.9220482782645836 * 1e48);
    });
  });

  it('coverage: caches the "_id" property', () => {
    const blockHeader = BlockHeader.fromRawBlock(dataRawBlockBuffer);
    blockHeader.id.should.equal(blockHeader.id);
  });
});
