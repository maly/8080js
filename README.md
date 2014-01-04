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


Tests
-----

8080js is slightly tested with qUnit - just a basic functionality at this moment

Use emu8080test.html for testing with a real test suite

Roadmap
-------

- Change it from self-called constructor to real class
- Prepare exerciser as inline test