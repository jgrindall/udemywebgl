var canvas = document.getElementById("gameCanvas"), gl = canvas.getContext("webgl2");

var points = {
	a : [1, 1, 1],
	b : [1, -1, 1],
	c : [1, 1, -1],
	d : [1, -1, -1],
	e : [-1, 1, 1],
	f : [-1, -1, 1],
	g : [-1, 1, -1],
	h : [-1, -1, -1],
};

var v = [points.g, points.e, points.c,      points.c, points.e, points.a,      points.c, points.a, points.d,      points.d, points.a, points.b,    points.g, points.h, points.d,      points.g, points.d, points.c];
var c = [COLORS.RED, COLORS.RED, COLORS.RED,       COLORS.RED, COLORS.RED, COLORS.RED,       COLORS.GREEN, COLORS.GREEN, COLORS.GREEN,       COLORS.GREEN, COLORS.GREEN, COLORS.GREEN,    COLORS.BLUE, COLORS.BLUE, COLORS.BLUE,     COLORS.BLUE, COLORS.BLUE, COLORS.BLUE];

v = _.flatten(v);
c = _.flatten(c);

var _compileShader = function(id, type){
    var shader = gl.createShader(type);
    gl.shaderSource(shader, document.getElementById(id).text.trim());
    gl.compileShader(shader);
    return shader;
};

var _getBuffer = function(data){
	var b = gl.createBuffer();
	gl.bindBuffer(gl.ARRAY_BUFFER, b);
	gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(data), gl.STATIC_DRAW);
	return b;
};

var _makeProgram = function(ids, types){
	var prog = gl.createProgram();
	_.each(ids, function(id, i){
		gl.attachShader(prog, _compileShader(id, types[i]));
	});
	gl.linkProgram(prog);
	gl.useProgram(prog);
	return prog;
};

_setupBuffer = function(prog, attribName, buffer, length){
	var attribLoc = gl.getAttribLocation(prog, attribName);
	gl.enableVertexAttribArray(attribLoc);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribLoc, length, gl.FLOAT, false, 0, 0);
};

var _setUniform = function(prog, name, mat){
	gl.uniformMatrix4fv(gl.getUniformLocation(prog, name), false, mat);
};

var vbuf = _getBuffer(v), cbuf = _getBuffer(c);

var prog = _makeProgram(["vshader", "fshader"], [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER]);

var vao = gl.createVertexArray();
gl.bindVertexArray(vao);

_setupBuffer(prog, "position", vbuf, 3);
_setupBuffer(prog, "color", cbuf, 4);

var modelMat = mat4.create();
var viewMat = mat4.create();
var projMat = mat4.perspective(mat4.create(), 45*Math.PI/180, 800/600, 0.1, 20);
var angle = 0;

_setUniform(prog, "projMat", projMat);
_setUniform(prog, "viewMat", viewMat);


var _render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.65, 0.65, 0.7, 1);

    mat4.identity(modelMat);
    mat4.translate(modelMat, modelMat, [0, 0, -10]);
    mat4.rotateY(modelMat, modelMat, angle);
    mat4.rotateZ(modelMat, modelMat, angle/5);

    // A -> ATRR  (rotate applied first)
    // Av -> ATRRv  (rotate applied first)

    angle += 0.025;

    _setUniform(prog, "modelMat", modelMat);

    gl.useProgram(prog);
    gl.bindVertexArray(vao);
    gl.drawArrays(gl.TRIANGLES, 0, v.length/3);
    requestAnimationFrame(_render);
};

requestAnimationFrame(_render);

