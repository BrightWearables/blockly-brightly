var SLOW = '.02';
var MEDIUM = '.01';
var FAST = '0';
var classPrefix = 'brightly.';

function speedToNum(speed) {
  if (speed === "SLOW"){
    return SLOW;
  } else if (speed === "MEDIUM") {
	return MEDIUM;
  } else {
	return FAST;
  }
};

function hexToRGB(str) {
	return '(' + parseInt(str.substring(1,3), 16) + ',' + parseInt(str.substring(3,5),16) + ',' + parseInt(str.substring(5,7), 16) + ')';
}

function setCodeValues(str, name, val) {
	if (typeof(val) !== "string") {
		val = val.toString();
	}
	str = str.replace(name, val);
	return str;
}
// Takes in value 1-100 Must convert to value between 0-1 for Neopixel brightness call
function setBrightness(str, val) {
	str = str.replace("%BRIGHTNESS%", (val/100).toString())
	return str;
}

function setNumpix(str, val) {
	str = str.replace("%NUMPIX%", DEF_NUM_LEDS);
	return str;
}

// Substitute variables for color tuples that are repeated often to free up space
function replaceTuples(str) {
	var REP_THRESHOLD = 3;
	var re = /\(\d*,\d*,\d*\)/g;
	var m;
    var map = {};
	var tuplesReplaced = "";
	// Locate and count all tuples
	do {
		m = re.exec(str);
		if (m) {
			if (map[m]) {
				map[m] += 1;
			} else {
				map[m] = 1;
			}
		}
	} while (m);
	// Replace all frequently repeated tuples
	var entries = Object.entries(map);
	var index = 0;
	for( [k,v] of Object.entries(map) ) {
		if (v > REP_THRESHOLD) {
			var varName = "COL_" + index;
			index++;
			tuplesReplaced = tuplesReplaced + varName + " = " + k + "\n"
			var tk = '\\' + k.substring(0, k.length - 1) + '\\' + ')';
			var re_k = new RegExp(tk, 'g');
			str = str.replace(re_k, varName);
		}
	}
    // Add declaration of tuple replacement variables
	str = str.replace("%TUPLE_LIST%", tuplesReplaced);
	return str;
};


Blockly.Python['color_led'] = function(block) {
  var code = '[';
  if (DEF_NUM_LEDS > 0) {
	code += hexToRGB(block.getFieldValue('C1'));
  }
  for (var i = 1; i < DEF_NUM_LEDS; i++) {
    code = code + ',' + hexToRGB(block.getFieldValue('C' + (i+1).toString()));
  }
  code += ']';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['smooth_change_to'] = function(block) {
  var dropdown_speed = block.getFieldValue('speed');
  var value_color_list = Blockly.Python.valueToCode(block, 'COLOR_LIST', Blockly.Python.ORDER_NONE);
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'smooth_change_to(' + value_color_list + ', ' + speedToNum(dropdown_speed) + ')\n';
  return code;
};

Blockly.Python['rotate_leds'] = function(block) {
  var number_rotation_amt = block.getFieldValue('ROTATION_AMT');
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'rotate_pix(' + number_rotation_amt + ')\n';
  return code;
};

Blockly.Python['block_wait'] = function(block) {
  var number_wait_ms = block.getFieldValue('WAIT_SEC');
  // TODO: Assemble Python into code variable.
  var code = 'time.sleep(' + number_wait_ms + ')\n';
  return code;
};

Blockly.Python['run_repeatedly'] = function(block) {
  var statements_forever = Blockly.Python.statementToCode(block, 'FOREVER');
  // TODO: Assemble Python into code variable.
  if (statements_forever === "") {
	return "";
  } else {
	var code = '#code in this loop runs forever\nwhile True:\n' + statements_forever + '\n';
	return code;
  }
};

Blockly.Python['run_on_start'] = function(block) {
  var statements_startup = Blockly.Python.statementToCode(block, 'STARTUP');
  if (statements_startup ==+ "") {
	  return "";
  } else {
    var code = '#code to run once on start goes here\ndef on_start():\n';
    code = code + statements_startup + '\non_start()\n';
    return code;
  }
};

Blockly.Python['shift_leds'] = function(block) {
  var number_shift_amt = block.getFieldValue('SHIFT_AMT');
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'shift_pix(' + number_shift_amt + ')\n';
  return code;
};

Blockly.Python['change_to'] = function(block) {
  var value_color_list = Blockly.Python.valueToCode(block, 'COLOR_LIST', Blockly.Python.ORDER_NONE);
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'set_pixels(' + value_color_list + ')\n';
  return code;
};

Blockly.Python['twinkle'] = function(block) {
  var number_nleds = block.getFieldValue('nleds');
  var number_nseconds = block.getFieldValue('nseconds');
  var value_color_list = Blockly.Python.valueToCode(block, 'COLOR_LIST', Blockly.Python.ORDER_ATOMIC);
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'twinkle(' + number_nleds + ',' + value_color_list + ',' + number_nseconds + ')\n';
  return code;
};

Blockly.Python['wipe_color'] = function(block) {
  var value_color_list = Blockly.Python.valueToCode(block, 'COLOR_LIST', Blockly.Python.ORDER_NONE);
  var dropdown_direction = block.getFieldValue('DIRECTION');
  var dropdown_speed = block.getFieldValue('SPEED');
  var delay = ".4";
  var dir = "1";
  if (dropdown_direction === "HIGH_TO_LOW") dir = "-1";
  if (dropdown_speed === "MEDIUM") {
	  delay = "0.2";
  } else if (dropdown_speed == "FAST") {
	  delay = "0.05";
  }
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'wipe(' + delay + ', ' + dir + ', ' + value_color_list +  ')\n';
  return code;
};

Blockly.Python['single_color_led'] = function(block) {
  var colour_c1 = block.getFieldValue('C1');
  // TODO: Assemble Python into code variable.
  var code = hexToRGB(colour_c1);
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};


Blockly.Python['color_wheel_value'] = function(block) {
  var angle_wheel_angle = block.getFieldValue('WHEEL_ANGLE');
  // TODO: Assemble Python into code variable.
  var code = wheelColor(angle_wheel_angle, false); 
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['random_color'] = function(block) {
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'random_color()';
  // TODO: Change ORDER_NONE to the correct strength.
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['color_led_expanded'] = function(block) {
  var code = '[';
  if (DEF_NUM_LEDS > 0) {
	code += Blockly.Python.valueToCode(block, 'C1', Blockly.Python.ORDER_NONE);
  }
  for (var i = 1; i < DEF_NUM_LEDS; i++) {
    code = code + ',' + Blockly.Python.valueToCode(block, 'C' + (i+1).toString(), Blockly.Python.ORDER_NONE);
  }
  code += ']';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_led_at'] = function(block) {
  var number_led_index = parseInt(block.getFieldValue('LED_INDEX')) - 1;
  var value_color_value = Blockly.Python.valueToCode(block, 'COLOR_VALUE', Blockly.Python.ORDER_NONE);
  var dropdown_name = block.getFieldValue('NAME');
  var show_now = "False";
  if (dropdown_name === "SHOW_NOW") {
	show_now = "True";
  }
  // TODO: Assemble Python into code variable.
  var code = classPrefix + 'set_one_pixel(' + number_led_index + ',' + value_color_value + ',' + show_now + ')\n';
  return code;
};

Blockly.Python['variable_color_list'] = function(block) {
  /*alert("not written yet!");
  var code = "";
  return code;
  */
  code = Blockly.Python['lists_create_with'](block);
  return code;
};

Blockly.Python['rainbow_led'] = function(block) {
  var code = classPrefix + 'rainbow(' + block.getFieldValue("START_ANGLE") + ', ' + block.getFieldValue("END_ANGLE") + ')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['set_brightness'] = function(block) {
  // var number_bright_val = block.getFieldValue('BRIGHT_VAL');
  // We process the code from this block separately
  var code = "";
  return code;
};

Blockly.Python['rgb_color'] = function(block) {
  var number_r_val = block.getFieldValue('R_VAL');
  var number_g_val = block.getFieldValue('G_VAL');
  var number_b_val = block.getFieldValue('B_VAL');
  // Assemble Python into code variable.
  var code = '(' + parseInt(number_r_val) + ',' + number_g_val + ',' + number_b_val + ')';
  return [code, Blockly.Python.ORDER_NONE];
};

Blockly.Python['morse'] = function(block) {
  var text_morse_text = block.getFieldValue('MORSE_TEXT');
  var value_text_color = Blockly.Python.valueToCode(block, 'TEXT_COLOR', Blockly.Python.ORDER_NONE);
  var dropdown_speed = block.getFieldValue('SPEED');
  var dropdown_direction = block.getFieldValue('DIRECTION');

  // Assemble Python into code variable.
  var dir = "1";
  if (dropdown_direction === "HIGH_TO_LOW") dir = "-1";
  var code = classPrefix + 'scroll_morse(' + '"' + text_morse_text + '"' + ',' + value_text_color + ',' + dir + ',';
  
  if (dropdown_speed === "SPEED_SLOW") {
	  code += "0.2";
  } else if (dropdown_speed === "SPEED_MEDIUM") {
	  code += "0.1";
  } else {
	  code += "0.05";
  }
  code += ")\n";
  return code;
};