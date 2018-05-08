
var ledList = ["#ff0000", "#ff9900", "#ffff00", "#33ff33", "#66cccc", "#33ccff", "#6666cc", "#cc33cc"];
function defaultColorFromList(index) {
	var col;
	var descending  = (Math.floor(index/ledList.length)  % 2);
	if (descending) {
		col = ledList[(ledList.length - 2 )- (index % ledList.length)]
	} else {
		col = ledList[index % ledList.length];			
	}
	return col;
};

// Function for color wheel
function rgbToHex(rgb) { 
  var hex = Number(rgb).toString(16);
  if (hex.length < 2) {
       hex = "0" + hex;
  }
  return hex;
};

function clamp(val, min, max) {
	if (val < Math.min(min)) val = min;
	else if (val > Math.max(max)) val = max;
    return val;
}

function rgbTupleToHex(r,g,b) {
	r = clamp(r, 0, 255)
	g = clamp(g, 0, 255)
	b = clamp(b, 0, 255)
	return '#' + rgbToHex(r) + rgbToHex(g) + rgbToHex(b); 
}

// Returns hex formatted number, otherwise RGB triplet
function wheelColor(pos, hexFormat = true) {
	pos = Math.round(pos*255/360);
	rVal = "";
	if (hexFormat) rVal = rVal + '#';
	else rVal = rVal + '(';

	if (pos < 85) {
		if(hexFormat) rVal = rVal + rgbToHex(255-pos*3) + rgbToHex(pos*3) + "00";
		else rVal = rVal + (255-pos*3).toString() + ',' + (pos*3).toString() + ',0)';
	} else if (pos < 170) {
		pos -= 85;
		if(hexFormat) rVal = rVal + "00" + rgbToHex(255-pos*3) + rgbToHex(pos*3); 
		else rVal = rVal +  '0,' + (255-pos*3).toString() + ',' + (pos*3).toString() +')';
	} else {
		pos -= 170;
		if (hexFormat) rVal = rVal + rgbToHex(pos*3) + "00" + rgbToHex(255-pos*3);
		else rVal = '(' + (pos*3).toString() + ',0,' + (255-pos*3).toString() + ')';
	}
	return rVal;
}

// Handler for color wheel value change
function onChangeWheelValue(event) {
	if ((event.type === Blockly.Events.CHANGE) &&
	    (event.element === 'field') &&
		(event.name === 'WHEEL_ANGLE') &&
		(event.newValue != event.oldValue)) {
			block = workspace.getBlockById(event.blockId);
			var col = wheelColor(event.newValue);
			block.setColour(col);
		}
}

function onChangeRGBValues(event){
	if ((event.type === Blockly.Events.CHANGE) &&
	    (event.element === 'field') &&
		((event.name === 'R_VAL') || (event.name === 'G_VAL') || (event.name === 'B_VAL')) &&
		(event.newValue != event.oldValue)) {
			block = workspace.getBlockById(event.blockId);
			block.setRGBColor_();
	}
};

function validateMorseText(txt) {
    var newTxt = "";
	var changed = false;
	for (i = 0; i < txt.length; i++) {
	  var ch = txt.charCodeAt(i);
	  //console.log(ch);
	  if (ch > 96 && ch < 123) {  //lower alpha (a-z)
		newTxt +=  String.fromCharCode(ch - 32);
		changed = true;
	  } else if ((ch == 32) || (ch > 64 && ch < 91) || (ch > 47 && ch < 58)) {  // Check for ' ' or alphanumeric
		newTxt += String.fromCharCode(ch);
	  } else {
		changed = true;
	  }
	}
	if (changed) {
	  return newTxt;
	}  else {
	  return txt;
	}
};

function setFieldColors(block) {
	var index = 1;			
	var fn = "C" + index;
	var field = block.getField(fn);
	var colorFields = [];
	while (field != null && index < 16) {
		colorFields.push(fn);
		index++;
		fn = "C" + index;
		field = block.getField(fn);
	}
	var startIndex = parseInt((block.getField("START_ANGLE")).getValue());
	var endIndex = parseInt((block.getField("END_ANGLE")).getValue()); 
	var increment = (endIndex - startIndex)/colorFields.length;
	for(var j = 0; j < colorFields.length; j++) {
		var colindex = Math.round(startIndex + j*increment);
		block.getField(colorFields[j]).setValue((wheelColor(colindex, true)));
	}
}

function onChangeRainbowWheelValues(event) {
	if ((event.type === Blockly.Events.CHANGE) &&
	    (event.element === 'field') &&
		((event.name === 'START_ANGLE') || (event.name === 'END_ANGLE')) &&
		(event.newValue != event.oldValue)) {
			block = workspace.getBlockById(event.blockId);
			block.setFieldColors_();
	}
}

function defBlocksWithSize(DEF_NUM_LEDS) {

	Blockly.Blocks['color_led'] = {
	  init: function() {
		// Color list defined here may be overwritten in workspace XML definition
		var ledList = ["#ff0000", "#ff9900", "#ffff00", "#33ff33", "#66cccc", "#33ccff", "#6666cc", "#cc33cc"];
		var di = this.appendDummyInput();
		for (var i = 0; i < DEF_NUM_LEDS; i++) {
			var label =(i+1).toString();
			var col = defaultColorFromList(i);
			di = di.appendField(label).appendField(new Blockly.FieldColour(col), 'C' + label);
		}
		this.setInputsInline(true);
		this.setOutput(true, "color_led_list");
		this.setColour(330);
	 this.setTooltip("Colors of the headband LEDs.");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['smooth_change_to'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("smooth change at speed")
			.appendField(new Blockly.FieldDropdown([["slow","SLOW"], ["medium","MEDIUM"], ["fast","FAST"]]), "speed")
			.appendField("to");
		this.appendValueInput("COLOR_LIST")
			.setCheck(["color_led", "color_led_list"]);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
	 this.setTooltip("Smoothly change LED colors to newly specified values. Slower than change to.");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['rotate_leds'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("rotate LED colors by")
			.appendField(new Blockly.FieldNumber(1, -(DEF_NUM_LEDS-1), DEF_NUM_LEDS-1, 1), "ROTATION_AMT");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
	 this.setTooltip("Rotates the LED pattern by the specified number of places. LED colors loop around.");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['block_wait'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("wait")
			.appendField(new Blockly.FieldNumber(0.5, 0, 100, 0.001), "WAIT_SEC")
			.appendField("seconds");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
	 this.setTooltip("Pauses the code for the specified number of seconds.");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['run_repeatedly'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("run forever");
		this.appendStatementInput("FOREVER")
			.setCheck(null);
		this.setColour(135);
	 this.setTooltip("Code blocks placed here will run in sequence forever");
	 this.setHelpUrl("");
	 this.setDeletable(false);  // **THIS VALUE ADDED NOT GENERATED**
	  }
	};

	Blockly.Blocks['run_on_start'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("run once at start with LED brightness")
			.appendField(new Blockly.FieldNumber(20, 0, 100, 1), "BRIGHTNESS")
			.appendField("% using pin")
			.appendField(new Blockly.FieldDropdown([["D1", "D1"], ["D2", "D2"], ["D3", "D3"], ["D4", "D4"], ["D5", "D5"], ["D6", "D6"], ["D7", "D7"], ["D8", "D8"], ["A1", "A1"], ["A2", "A2"], ["A3", "A3"], ["A4", "A4"], ["A5", "A5"], ["A6", "A6"], ["A7", "A7"], ["A8", "A8"]]), "PIN");
		this.appendStatementInput("STARTUP")
			.setCheck(null);
		this.setColour(135);
	 this.setTooltip("Code blocks placed here will run once at the program startup");
	 this.setHelpUrl("");
	 this.setDeletable(false);  // **THIS VALUE ADDED NOT GENERATED**
	  }
	};

	Blockly.Blocks['shift_leds'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("shift LED colors by")
			.appendField(new Blockly.FieldNumber(1, -13, 13, 1), "SHIFT_AMT");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
	 this.setTooltip("Shifts the LED pattern by the specified number of places. Colors moved off the ends are deleted.");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['change_to'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("change to");
		this.appendValueInput("COLOR_LIST")
			.setCheck(["color_led", "color_led_list", "Number"]);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(330);
	 this.setTooltip("Changes LED colors to newly specified values");
	 this.setHelpUrl("");
	  }
	};



	// Copy list block, and change a few things
	Blockly.Blocks['variable_color_list'] = 
	  Object.create(Blockly.Blocks['lists_create_with']);
	  
	(Blockly.Blocks['variable_color_list'])['init'] = function() {
		this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL);
		this.setColour(65);
		this.itemCount_ = 3;
		this.setInputsInline(true);
		this.updateShape_();
		this.setOutput(true, 'color_array');
		this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
		this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
	  };
	(Blockly.Blocks['variable_color_list'])['updateShape_'] = function() {
		if (this.itemCount_ && this.getInput('EMPTY')) {
		  this.removeInput('EMPTY');
		} else if (!this.itemCount_ && !this.getInput('EMPTY')) {
		  this.appendDummyInput('EMPTY')
			  .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
		}
	 
		var i;
		for (i = 0; i < this.itemCount_; i++) {
		  if (!this.getInput('ADD' + i)) {
			var input = this.appendValueInput('ADD' + i)
							 .setCheck(["color_led", "Number"]);	
		  }
		}
		// Remove deleted inputs.
		while (this.getInput('ADD' + i)) {
		  this.removeInput('ADD' + i);
		  i++;
		}
	  };	

	Blockly.Blocks['twinkle'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("twinkle")
			.appendField(new Blockly.FieldNumber(3, 1, DEF_NUM_LEDS, 1), "nleds")
			.appendField("LEDs for")
			.appendField(new Blockly.FieldNumber(10, 0.1, 60, 0.1), "nseconds")
			.appendField("seconds, using color(s)");
		this.appendValueInput("COLOR_LIST")
			.setCheck(["color_led", "Number", "color_led_list", "color_array"]);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(65);
	 this.setTooltip("makes leds flash in a random twinkle pattern using the specified colors");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['wipe_color'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("swipe color ");
		this.appendValueInput("COLOR_LIST")
			.setCheck(["color_led", "color_led_list", "Number"]);
		this.appendDummyInput()
			.appendField("from")
			.appendField(new Blockly.FieldDropdown([["low to high","LOW_TO_HIGH"], ["high to low","HIGH_TO_LOW"]]), "DIRECTION")
			.appendField("LEDs at speed")
			.appendField(new Blockly.FieldDropdown([["slow","SLOW"], ["medium","MEDIUM"], ["fast","FAST"]]), "SPEED");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(60);
	 this.setTooltip("changes all LEDs to the specified color one at a time");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['single_color_led'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField(new Blockly.FieldColour("#ff0000"), "C1");
		this.setOutput(true, "color_led");
		this.setColour(330);
	 this.setTooltip("Specifies a single color");
	 this.setHelpUrl("");
	  }
	};



	Blockly.Blocks['color_wheel_value'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("color wheel", "BLOCK_TEXT")
			.appendField(new Blockly.FieldAngle(0), "WHEEL_ANGLE")
		this.setOutput(true, "color_led");
		this.setColour(wheelColor(0));
	 this.setTooltip("Gets a color from the color wheel using an input value from 0 to 360");
	 this.setHelpUrl("");
	 this.setOnChange(onChangeWheelValue);
	  }
	};



	Blockly.Blocks['random_color'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("random color");
		this.setOutput(true, "color_led");
		this.setColour(330);
	 this.setTooltip("generates a random color value");
	 this.setHelpUrl("");
	  }
	};

	Blockly.Blocks['color_led_expanded'] = {
	  init: function() {
		for (var i = 0; i < DEF_NUM_LEDS; i++) {
			label = (i + 1).toString();
			this.appendDummyInput().appendField(label);
			this.appendValueInput('C' + label).setCheck(["color_led", "Number"]);
		}
		this.setInputsInline(true);
		this.setOutput(true, "color_led_list");
		this.setColour(330);
	 this.setTooltip("Colors of the headband LEDs.");
	 this.setHelpUrl("");
	  }
	};


	Blockly.Blocks['set_led_at'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("set led")
			.appendField(new Blockly.FieldNumber(0, 1, DEF_NUM_LEDS, 1), "LED_INDEX")
			.appendField("to");
		this.appendValueInput("COLOR_VALUE")
			.setCheck(["Number", "color_led"]);
		this.appendDummyInput()
			.appendField("and")
			.appendField(new Blockly.FieldDropdown([["show now","SHOW_NOW"], ["wait to show","WAIT_TO_SHOW"]]), "NAME");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(330);
	 this.setTooltip("sets the color of the specified LED");
	 this.setHelpUrl("");
	  }
	  
	};


	Blockly.Blocks['rainbow_led'] = {
	  setFieldColors_:function() {
		var startIndex = parseInt((this.getField("START_ANGLE")).getValue());
		var endIndex = parseInt((this.getField("END_ANGLE")).getValue()); 
		var increment = (endIndex - startIndex)/DEF_NUM_LEDS;
		for(var i = 0; i < DEF_NUM_LEDS; i++) {
			var colindex = Math.round(startIndex + i*increment);
			this.getField('C' + (i+1).toString()).setValue((wheelColor(colindex, true)));
		}
	  },
	  init: function() {
		di = this.appendDummyInput()
			.appendField("rainbow from ")
			.appendField(new Blockly.FieldAngle(0), "START_ANGLE")
			.appendField("to")
			.appendField(new Blockly.FieldAngle(359), "END_ANGLE")
			.appendField(" ");
			var increment = Math.floor(359/DEF_NUM_LEDS);
		for (var i = 0; i < DEF_NUM_LEDS; i++) {
			di = di.appendField(new Blockly.FieldColour(wheelColor(i*increment, true)), 'C' + (i+1).toString());
		}
		this.setOutput(true, "color_led_list");
		this.setColour(330);
		this.setTooltip("");
		this.setHelpUrl("");
		this.setOnChange(onChangeRainbowWheelValues);
		this.setFieldColors_();
		// Disable direct editing of the color displays
		for (var i = 0; i < DEF_NUM_LEDS; i++) {
			var f = this.getField('C' + (i+1).toString());
			if (f) {
				f.EDITABLE = 0;
			}
		}
	  }
	};

	Blockly.Blocks['set_brightness'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("set brightness (1-100)")
			.appendField(new Blockly.FieldNumber(30, 1, 100, 1), "BRIGHT_VAL");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(330);
	   this.setTooltip("set the brightness from 1-100. Only place this block in \"on start\"");
	   this.setHelpUrl("");
	   this.setDeletable(false);  // **ADDED NOT GENERATED**
	  }
	};


	Blockly.Blocks['rgb_color'] = {
	  setRGBColor_:function() {
		  var r = parseInt((this.getField("R_VAL")).getValue());
		  var g = parseInt((this.getField("G_VAL")).getValue());
		  var b = parseInt((this.getField("B_VAL")).getValue());
		  block.setColour(rgbTupleToHex(r,g,b));
	  },
	  init: function() {
		this.appendDummyInput()
			.appendField("R")
			.appendField(new Blockly.FieldNumber(0, 0, 255, 1), "R_VAL")
			.appendField("G")
			.appendField(new Blockly.FieldNumber(0, 0, 255, 1), "G_VAL")
			.appendField("B")
			.appendField(new Blockly.FieldNumber(0, 0, 255, 1), "B_VAL");
		this.setOutput(true, "color_led");
		this.setColour("#000000");
	 this.setTooltip("Enter RGB values from 0 to 255");
	 this.setOnChange(onChangeRGBValues);
	 this.setHelpUrl("");
	  }
	};


	Blockly.Blocks['morse'] = {
	  init: function() {
		this.appendDummyInput()
			.appendField("scroll morse code for")
			.appendField(new Blockly.FieldTextInput("HELLO", validateMorseText), "MORSE_TEXT")
			.appendField("in color");
		this.appendValueInput("TEXT_COLOR")
			.setCheck("color_led");
		this.appendDummyInput()
			.appendField("at speed")
			.appendField(new Blockly.FieldDropdown([["slow","SPEED_SLOW"], ["medium","SPEED_MEDIUM"], ["fast","SPEED_FAST"]]), "SPEED")
			.appendField("from")
			.appendField(new Blockly.FieldDropdown([["low to high","LOW_TO_HIGH"], ["high to low","HIGH_TO_LOW"]]), "DIRECTION")
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(65);
	 this.setTooltip("");
	 this.setHelpUrl("");
	  }
	};

};

// Obtain the number of LEDs from GET params and create the code blocks accordingly
function $_GET(param) {
	var vars = {};
	window.location.href.replace( location.hash, '' ).replace( 
		/[?&]+([^=&]+)=?([^&]*)?/gi, // regexp
		function( m, key, value ) { // callback
			vars[key] = value !== undefined ? value : '';
		}
	);

	if ( param ) {
		return vars[param] ? vars[param] : null;	
	}
	return vars;
}
var DEF_NUM_LEDS = $_GET("NUM_LEDS");
if (DEF_NUM_LEDS === null) DEF_NUM_LEDS = 14;
else if (DEF_NUM_LEDS > 24) DEF_NUM_LEDS = 24;

// Creating code blocks
defBlocksWithSize(DEF_NUM_LEDS);