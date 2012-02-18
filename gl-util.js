'use strict';

function checkError(gl)
{
	var error = gl.getError();
	if (error != gl.NO_ERROR && ! gl.isInError) {
		console.log("error: gl error[0x" + error.toString(16) + "]");
		gl.isInError = true;
	}
}

function bindVertexBuffer(gl, loc, buffer)
{
	gl.enableVertexAttribArray(loc);
	gl.bindBuffer(buffer.target, buffer);
	gl.vertexAttribPointer(loc, buffer.itemSize, buffer.itemType, false, 0, 0);
}

function createBuffer(gl, target, data_src, item_type, item_size) {
	if (data_src.length % item_size != 0) {
		console.log("error: data_src.length[" + data_src.length + "] should be multiply of item_size[" + item_size + "]");
	}
	var buffer = gl.createBuffer();
	gl.bindBuffer(target, buffer);
	switch (item_type) {
	case gl.UNSIGNED_SHORT:
		var data_arr = new Uint16Array(data_src)
		break;
	case gl.FLOAT:
		var data_arr = new Float32Array(data_src)
		break;
	}
	gl.bufferData(target, data_arr, gl.STATIC_DRAW);
	buffer.target = target;
	buffer.itemType = item_type;
	buffer.itemSize = item_size;
	buffer.itemNum = data_src.length / item_size;
	return buffer;
}

function createIcosahedronBufferSet(gl) {
	var a = 1 / Math.sqrt(5);
	var b = (1 - a) / 2;
	var c = (1 + a) / 2;
	var d = Math.sqrt(b);
	var e = Math.sqrt(c);
	var i;
	
	var bufferSet = {}
	var positionSrc = [0,1,0, 0,a,2*a, e,a,b, d,a,-c, -d,a,-c, -e,a,b, d,-a,c, e,-a,-b, 0,-a,-2*a, -e,-a,-b, -d,-a,c, 0,-1,0];
	
	bufferSet.position = createBuffer(gl, gl.ARRAY_BUFFER, positionSrc, gl.FLOAT, 3);
	// normal is same as position
	bufferSet.normal = bufferSet.position;
	var indexSrc = [0,1,2, 0,2,3, 0,3,4, 0,4,5, 0,5,1, 2,1,6, 3,2,7, 4,3,8, 5,4,9, 1,5,10,
		11,10,9, 11,9,8, 11,8,7, 11,7,6, 11,6,10, 10,5,9, 9,4,8, 8,3,7, 7,2,6, 6,1,10];
	bufferSet.index = createBuffer(gl, gl.ELEMENT_ARRAY_BUFFER, indexSrc, gl.UNSIGNED_SHORT, 1);
	
	return bufferSet;
}

function createShaderProgram(gl, vs_script_id, fs_script_id) {
	var vertex_shader = loadShader(gl, "shader-vs");
	var fragment_shader = loadShader(gl, "shader-fs");
	
	var shader_program = gl.createProgram();
	gl.attachShader(shader_program, vertex_shader);
	gl.attachShader(shader_program, fragment_shader);
	gl.linkProgram(shader_program);
	
	var is_linked = gl.getProgramParameter(shader_program, gl.LINK_STATUS);
	if ( ! is_linked) {
		var error = gl.getProgramInfoLog(shader_program);
		console.log("error: link shader script id[" + vs_script_id + "] and [" + fs_script_id + "] failed ->\n" + error);
		gl.deleteProgram(shader_program);
		gl.deleteShader(vertex_shader);
		gl.deleteShader(fragment_shader);
		return null;
	}
	
	return shader_program;
}

function loadShader(gl, script_id) {
	var shader_script = document.getElementById(script_id);
	if ( ! shader_script) {
		console.log("error: cannot find script id[" + script_id + "].");
		return null;
	}
	
	if (shader_script.type == "x-shader/x-vertex") {
		var shader_type = gl.VERTEX_SHADER;
	} else if (shader_script.type == "x-shader/x-fragment") {
		var shader_type = gl.FRAGMENT_SHADER;
	} else {
		console.log("error: illegal shader type[" + shader_script.type + "] of script id[" + script_id + "].");
		return null;
	}
	
	var shader = gl.createShader(shader_type);
	if ( ! shader) {
		console.log("error: unnable to create shader from script id[" + script_id + "].");
		return null;
	}
	
	gl.shaderSource(shader, shader_script.text);
	gl.compileShader(shader);
	
	var is_compiled = gl.getShaderParameter(shader, gl.COMPILE_STATUS);
	if ( ! is_compiled) {
		var error = gl.getShaderInfoLog(shader);
		console.log("error: compile shader script id[" + script_id + "] failed ->\n" + error);
		gl.deleteShader(shader);
		return null;
	}
	
	return shader;
}
