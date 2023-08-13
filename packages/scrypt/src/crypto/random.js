"use strict";

import crypto from "node:crypto";
import { Buffer } from "buffer";

class Random {
  /* secure random bytes that sometimes throws an error due to lack of entropy */
  static getRandomBuffer(size) {
    return Random.getRandomBufferBrowser(size);
  }

  static getRandomBufferNode(size) {
    return crypto.randomBytes(size);
  }

  static getRandomBufferBrowser(size) {
    if (!window.crypto && !window.msCrypto) {
      throw new Error("window.crypto not available");
    }
    var crypto;

    if (window.crypto && window.crypto.getRandomValues) {
      crypto = window.crypto;
    } else if (window.msCrypto && window.msCrypto.getRandomValues) { // internet explorer
      crypto = window.msCrypto;
    } else {
      throw new Error("window.crypto.getRandomValues not available");
    }

    var bbuf = new Uint8Array(size);
    crypto.getRandomValues(bbuf);
    var buf = Buffer.from(bbuf);

    return buf;
  }
}

export default Random;
