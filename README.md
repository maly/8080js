8080js
======

Precise JavaScript emulation of Intel 8080 CPU

Based on BSD-licensed work by Copyright (C) 2008 Chris Double
 
All flags and instructions fixed to provide perfect compatibility 
with original "silicon" CPU.

This emulator passes the Exerciser http://www.idb.me.uk/sunhillow/8080.html

Big thanks to Roman Borik (http://pmd85.borik.net). His help lets me 
achieve such a perfect HW compatibility.

Used in all emulations at [ASM80 online IDE](http://www.asm80.com)

Usage
-----

(a.k.a. The API)

- *window.CPU8080* - main object (instantiated at the start - it shall change)
- *CPU8080.init(memoryTo,memoryAt,ticker,portTo,portAt)* - Initializes the whole system. All parameters are callback functions for port / memory access:
	- memoryTo(addr,value) - store byte to given address
	- memoryAt(addr) - read byte from given address
	- ticker(T) - unused. For future use
	- portTo(addr,value) - write byte to given port
	- portAt(addr) - read byte from given port
- *CPU8080.T()* - returns clock ticks count from last init (or reset)
- *CPU8080.reset()* - does a CPU reset
- *CPU8080.set(register, value)* - sets internal register (named PC, A, B, C, D, E, H, L, F, SP) to a given value 
- *CPU8080.status()* - Returns a object {pc, a, b, c, d, e, h, l, f, sp} with actual state of internal registers
- *CPU8080.steps(N)* - Execute instructions as real CPU, which takes "no less than N" clock ticks.

Disassembler:

- *window.CPUD8080* - main disassembler object (instantiated at the start - it shall change)
- *CPUD8080.disasm(i,a,b)* - Disassembly instruction. You have to provide 3 bytes - first one is an instruction code, second and third are parameters (they can be omitted when instruction is single byte or two bytes). It returns an array of two elements: the first is instruction mnemonics, the second is an instruction length.

You can use 8080js also as Node.js module.

Tests
-----

Run the tests in Node.js (no dependencies, Node 20+) with `npm test`. It runs the basic tests (`test/node/cpu8080.test.js`) and the full CPU diagnostic – MICROCOSM ASSOCIATES 8080/8085 CPU DIAGNOSTIC VERSION 1.0 (`test/node/cpudiag.test.js`, program in `test/fixtures/cpudiag.hex`). The diagnostic test fails when the program reaches its error exit (0x06A5) or does not finish within 1,000,000 steps.

The browser version of the basic tests (qUnit + JSHint) is `test/index.html`. `test/emu8080test.html` runs the same CPU diagnostic manually in a browser (its inline hex must be kept identical to `test/fixtures/cpudiag.hex`).

Roadmap
-------

- Change it from self-called constructor to real class

Support
-------

[![Become a Patron!](https://github.com/omenmicro/omenmicro.eu/blob/master/img/become-a-patron-button.png?raw=true)](https://www.patreon.com/bePatron?u=23689010)
