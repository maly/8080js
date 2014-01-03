8080js
======

Precise JavaScript emulation of Intel 8080 CPU

Based on BSD-licensed work by Copyright (C) 2008 Chris Double
 
All flags and instructions fixed to provide perfect compatibility 
with original "silicon" CPU.

This emulator passes the Exerciser http://www.idb.me.uk/sunhillow/8080.html

Big thanks to Roman Borik (http://pmd85.borik.net). His help lets me 
achieve such a perfect HW compatibility.

Usage
-----

TBD

Tests
-----

8080js is slightly tested with qUnit - just a basic functionality at this moment

Use emu8080test.html for testing with a real test suite

Roadmap
-------

- Change it from self-called constructor to real class
- Prepare exerciser as inline test