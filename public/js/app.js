var canvas = document.getElementById("gameCanvas"), gl = canvas.getContext("webgl2");

var v = [POINTS.g, POINTS.e, POINTS.c,             POINTS.c, POINTS.e, POINTS.a,           POINTS.c, POINTS.a, POINTS.d,                     POINTS.d, POINTS.a, POINTS.b,               POINTS.g, POINTS.h, POINTS.d,                POINTS.g, POINTS.d, POINTS.c];
var c = [COLORS.RED, COLORS.RED, COLORS.RED,       COLORS.RED, COLORS.RED, COLORS.RED,       COLORS.GREEN, COLORS.GREEN, COLORS.GREEN,       COLORS.GREEN, COLORS.GREEN, COLORS.GREEN,    COLORS.BLUE, COLORS.BLUE, COLORS.BLUE,     COLORS.BLUE, COLORS.BLUE, COLORS.BLUE];

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

var _setupBuffer = function(prog, attribName, buffer, length){
	var attribLoc = gl.getAttribLocation(prog, attribName);
	gl.enableVertexAttribArray(attribLoc);
	gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
	gl.vertexAttribPointer(attribLoc, length, gl.FLOAT, false, 0, 0);
};

var _setUniform = function(prog, name, mat){
	gl.uniformMatrix4fv(gl.getUniformLocation(prog, name), false, mat);
};

var Obj = function(v, c, dx, speed){
	this.v = _.flatten(v);
	this.c = _.flatten(c);
	this.speed = speed;
	this.dx = dx;
	this.setup();
};

Obj.prototype.setup = function(){
	this.angle = 0;
	this.modelMat = mat4.create();
	this.vbuf = _getBuffer(this.v);
	this.cbuf = _getBuffer(this.c);
	this.prog = _makeProgram(["vshader", "fshader"], [gl.VERTEX_SHADER, gl.FRAGMENT_SHADER]);
	this.vao = gl.createVertexArray();
	gl.bindVertexArray(this.vao);
	_setupBuffer(this.prog, "position", this.vbuf, 3);
	_setupBuffer(this.prog, "color", this.cbuf, 4);
	_setUniform(this.prog, "projMat", mat4.perspective(mat4.create(), 45*Math.PI/180, 800/600, 0.1, 20));
	_setUniform(this.prog, "viewMat", mat4.create());
};

Obj.prototype.beforeRender = function(){
	mat4.identity(this.modelMat);
    mat4.translate(this.modelMat, this.modelMat, [this.dx, 0, -10]);
    mat4.rotateY(this.modelMat, this.modelMat, this.angle);
    mat4.rotateZ(this.modelMat, this.modelMat, this.angle/5);
    // A -> ATRR  (rotate applied first)
    // Av -> ATRRv  (rotate applied first)
    _setUniform(this.prog, "modelMat", this.modelMat);
    this.angle += this.speed;
};

var cube0 = new Obj(v, c, 0, 0.025);
var cube1 = new Obj(v, c, 3, 0.01);
var cube2 = new Obj(v, c, -3, -0.075);

var _draw = function(obj){
	gl.useProgram(obj.prog);
	obj.beforeRender();
    gl.bindVertexArray(obj.vao);
    gl.drawArrays(gl.TRIANGLES, 0, obj.v.length/3);
};

var _render = function(){
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
    gl.enable(gl.DEPTH_TEST);
    gl.clearColor(0.65, 0.65, 0.7, 1);
    _draw(cube0);
    _draw(cube1);
    _draw(cube2);
    requestAnimationFrame(_render);
};

requestAnimationFrame(_render);

