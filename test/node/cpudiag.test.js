'use strict';

// CPU diagnostika Intel 8080 (MICROCOSM ASSOCIATES 8080/8085 CPU DIAGNOSTIC
// VERSION 1.0, (C) 1980) – Node verze ručního testu test/emu8080test.html.
// Program je uložen jako Intel HEX v test/fixtures/cpudiag.hex.
const { test, describe } = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const CPU8080 = require('../../8080.js');

const HEX_FILE = path.join(__dirname, '..', 'fixtures', 'cpudiag.hex');
const MAX_STEPS = 1000000;
const PC_START = 0x0100;
const PC_OK = 0x06b7; // diagnostika skončila úspěchem ("CPU IS OPERATIONAL")
const PC_ERROR = 0x06a5; // chybový výstup ("CPU HAS FAILED! ERROR EXIT=")

const hex4 = (n) => (n & 0xffff).toString(16).toUpperCase().padStart(4, '0');

// Načte Intel HEX do paměti. Zpracovává jen datové záznamy (typ 00),
// ověřuje kontrolní součet každého záznamu a při chybě vyhodí výjimku.
function loadHex(text, mem) {
  const lines = text.split(/\r?\n/);
  for (let n = 0; n < lines.length; n++) {
    const ln = lines[n].trim();
    if (ln === '') continue;
    if (ln[0] !== ':' || !/^:[0-9A-Fa-f]+$/.test(ln) || ln.length < 11) {
      throw new Error(`Invalid Intel HEX record on line ${n + 1}: ${ln}`);
    }
    const len = parseInt(ln.slice(1, 3), 16);
    if (ln.length !== 11 + 2 * len) {
      throw new Error(`Invalid Intel HEX record length on line ${n + 1}: ${ln}`);
    }
    const addr = parseInt(ln.slice(3, 7), 16);
    const type = parseInt(ln.slice(7, 9), 16);

    let sum = 0;
    for (let i = 1; i < ln.length; i += 2) {
      sum = (sum + parseInt(ln.slice(i, i + 2), 16)) & 0xff;
    }
    if (sum !== 0) {
      throw new Error(`Intel HEX checksum error on line ${n + 1}: ${ln}`);
    }

    if (type === 0x00) {
      for (let i = 0; i < len; i++) {
        mem[(addr + i) & 0xffff] = parseInt(ln.slice(9 + 2 * i, 11 + 2 * i), 16);
      }
    }
  }
}

describe('CPU diagnostic', () => {
  test('MICROCOSM 8080/8085 CPU diagnostic passes', () => {
    const mem = new Uint8Array(65536);
    loadHex(fs.readFileSync(HEX_FILE, 'utf8'), mem);

    CPU8080.init(
      (a, v) => { mem[a & 0xffff] = v & 0xff; },
      (a) => mem[a & 0xffff],
      null,
      null,
      null
    );
    CPU8080.set('PC', PC_START);

    const last = [];
    for (let i = 0; i < MAX_STEPS; i++) {
      CPU8080.steps(1);
      const pc = CPU8080.status().pc;
      last.push(hex4(pc));
      if (last.length > 10) last.shift();

      if (pc === PC_OK) {
        assert.ok(true, 'CPU diagnostic finished OK');
        return;
      }
      if (pc === PC_ERROR) {
        assert.fail(`CPU diagnostic reported error exit at 0x06A5, last PCs: ${last.join(', ')}`);
      }
      if (pc === 0) {
        assert.fail(`unexpected warm boot, last PCs: ${last.join(', ')}`);
      }
    }
    assert.fail('diagnostic did not finish within 1,000,000 steps');
  });
});
