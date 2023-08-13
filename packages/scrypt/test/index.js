const should = require("chai").should();
import bsv from "bsv";

describe("#versionGuard", () => {
  it("global._bsv should be defined", () => {
    should.equal(global._bsv, bsv.version);
  });

  it("throw an error if version is already defined", () => {
    (() => {
      bsv.versionGuard("version");
    }).should.not.throw("More than one instance of bsv");
  });
});

export {};
