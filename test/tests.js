module("Syntax and coding standards");

jsHintTest( "JSHint", "../8080.js");

module("Basic tests");

test( "Namespace", function() {
	notEqual( CPU8080, null, "CPU8080 is defined" );
    equal( typeof(CPU8080), "object", "CPU8080 is an object" );
});

test( "Init", function() {
	CPU8080.init();
    equal( typeof(CPU8080.status().pc), "number", "CPU8080 INIT OK" );
});

module("Simple data tests", {
	setup: function () {
		CPU8080.init();
	}
});

test( "Reset", function() {
	CPU8080.set("PC",0x55);
	CPU8080.reset();
    equal( CPU8080.status().pc, 0, "Reset PC OK" );
	equal( CPU8080.T(), 0, "Reset T counter OK" );
});

test( "Register manipulations", function() {
	CPU8080.set("A",0x55);
	CPU8080.set("B",0xAA);
	CPU8080.set("SP",0x1234);
	CPU8080.set("PC",0xFFFF);
    equal( CPU8080.status().a, 0x55);
	equal( CPU8080.status().b, 0xaa);
	equal( CPU8080.status().sp, 0x1234);
	equal( CPU8080.status().pc, 0xffff);

});

module("Disassembler");

test ("NOP, just NOPs", function() {
	var d = CPUD8080.disasm(0,0,0,0,0);
	equal( d[0], "NOP", "Instruction decoded OK");	
	equal( d[1], 1, "Instruction length OK");	
});


test ("XRA A", function() {
	var d = CPUD8080.disasm(0xaf,0,0,0,0);
	equal( d[0], "XRA A", "Instruction decoded OK");	
	equal( d[1], 1, "Instruction length OK");	
});

module("Single step", {
	setup: function () {
		CPU8080.init(null, function(addr){return 0;});
		CPU8080.reset();
	}
});

test ("NOP, just NOPs", function() {
	CPU8080.steps(1);
	equal( CPU8080.status().pc, 0x0001, "NOP OK");	
	equal( CPU8080.T(), 4, "Timing OK");	
});

test ("RST7", function() {
	CPU8080.init(function(a,v){;}, function(addr){return 0xff;});
	CPU8080.steps(1);
	equal( CPU8080.status().pc, 0x0038, "RST7 OK");	
	equal( CPU8080.T(), 11, "Timing OK");	
});


/*

var tst;
module("Simple port outputs, mode 0", {
	setup: function () {
		tst= new CPU8080();
		tst.CTRL(0x80);
	}
});

test ("Port A", function(){
	tst.PA(0);
	equal( tst.PORTA(), 0, "Zero" );
	tst.PA(0x55);
	equal( tst.PORTA(), 0x55, "Pattern" );
	tst.PA(0xFF);
	equal( tst.PORTA(), 0xFF, "Full" );
	tst.PORTA(0xAA);
	equal( tst.PA(), 0xFF, "Full" );
});
test ("Port B", function(){
	tst.PB(0);
	equal( tst.PORTB(), 0, "Zero" );
	tst.PB(0x55);
	equal( tst.PORTB(), 0x55, "Pattern" );
	tst.PB(0xFF);
	equal( tst.PORTB(), 0xFF, "Full" );
	tst.PORTB(0xAA);
	equal( tst.PB(), 0xFF, "Full" );
});
test ("Port C", function(){
	tst.PC(0);
	equal( tst.PORTC(), 0, "Zero" );
	tst.PC(0x55);
	equal( tst.PORTC(), 0x55, "Pattern" );
	tst.PC(0xFF);
	equal( tst.PORTC(), 0xFF, "Full" );
	tst.PORTC(0xAA);
	equal( tst.PC(), 0xFF, "Full" );

});

test ("All ports", function(){
	tst.PA(0);
	tst.PB(0);
	tst.PC(0);
	equal( tst.PORTA(), 0, "Zero" );
	equal( tst.PORTB(), 0, "Zero" );
	equal( tst.PORTC(), 0, "Zero" );
	tst.PB(0x55);
	equal( tst.PORTA(), 0);
	equal( tst.PORTB(), 0x55);
	equal( tst.PORTC(), 0);
	tst.PA(0xAA);
	equal( tst.PORTA(), 0xAA);
	equal( tst.PORTB(), 0x55);
	equal( tst.PORTC(), 0);
	tst.PC(0xC3);
	equal( tst.PORTA(), 0xAA);
	equal( tst.PORTB(), 0x55);
	equal( tst.PORTC(), 0xc3);
	tst.PORTA(0xFF);
	tst.PORTB(0xF0);
	tst.PORTC(0x0F);
	equal( tst.PA(), 0xAA);
	equal( tst.PB(), 0x55);
	equal( tst.PC(), 0xC3);

});

module("Simple port inputs, mode 0", {
	setup: function () {
		tst= new CPU8080();
		tst.CTRL(0x9B);
	}
});

test ("Port A", function(){
	tst.PORTA(0);
	equal( tst.PA(), 0, "Zero" );
	tst.PA(0x55);
	equal( tst.PA(), 0, "Pattern" );
	tst.PORTA(0xFF);
	equal( tst.PA(), 0xFF, "Full" );
});


module("Port C bit manipulations", {
	setup: function () {
		tst= new CPU8080();
	}
});

test ("Set bit 0", function(){
	tst.CTRL(1);
	equal( tst.PORTC(), 1, "Set" );
});
test ("Set bit 7", function(){
	tst.CTRL(0x0f);
	equal( tst.PORTC(), 128, "Set" );
});

test ("Reset bit 7, leave bit 1 unchanged", function(){
	tst.CTRL(1);
	equal( tst.PORTC(), 1, "Set" );
	tst.CTRL(0x0f);
	equal( tst.PORTC(), 129, "Set" );
	tst.CTRL(0x0e);
	equal( tst.PORTC(), 1, "Set" );
});

module("Hooks test", {
	setup: function () {
		tst= new CPU8080();
	}
});

asyncTest ("Make user", function() {
	tst.hook(0,function(v,port){
		equal(v, 10, "PA hook OK");
		start();
	});
	tst.PA(10);
});


*/