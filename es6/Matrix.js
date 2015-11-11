var VectorFactory = require("./VectorFactory");
var MatrixFactory = require("./MatrixFactory");
var {SourceWriter, CodeBuilder} = require("code-builder");

export function create(dimensions, destination) {
	var length = dimensions * dimensions;
	var createArray = new Array(length);
	for (var i = 0; i < length; i++) createArray[i] = 0.0;
	for (var i = 0; i < dimensions; i++) createArray[i * dimensions + i] = 1.0;
	var createSource = `	return [${createArray.join(", ")}];`;
	var createFunction = CodeBuilder.compile("create", [], createSource, "Matrix" + dimensions + "x" + dimensions);

	var cloneSource = `	return out.slice();`;
	var cloneFunction = CodeBuilder.compile("clone", ["out"], cloneSource, "Matrix" + dimensions + "x" + dimensions);

	var scaleArray = createArray.slice();
	for (var i = 0; i < dimensions; i++) createArray[i * dimensions + i] = "s";
	var scaleSource = `	return [${scaleArray.join(", ")}];`;
	var scaleFunction = CodeBuilder.compile("scale", ["s"], scaleSource, "Matrix" + dimensions + "x" + dimensions);

	Object.defineProperties(destination, {
		"create": 		{value: createFunction},
		"clone": 		{value: cloneFunction},
		"copy": 		{value: copy(dimensions)},
		"scale": 		{value: scaleFunction},
		"multiply": 	{value: multiply(dimensions)},
		"map": 			{value: map(dimensions)},
		"determinant": 	{value: determinant(dimensions)},
		"invert": 		{value: invert(dimensions)},
		"adjoint": 		{value: adjoint(dimensions)},
		"transpose": 	{value: transpose(dimensions)}
	});
}

function copy(dimensions) {
	var source = new SourceWriter(),
		cb = new CodeBuilder(),
		out = cb.matrix(dimensions, "out"),
		m = cb.matrix(dimensions, "m");
	cb.assign(out, m);
	source.tab();
		cb.write(source, [cb.output(out)]);
	source.untab();
	return CodeBuilder.compile("copy", ["out", "m"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function multiply(dimensions) {
	var source = new SourceWriter(),
		cb = new CodeBuilder(),
		out = cb.matrix(dimensions, "out"),
		m = cb.matrix(dimensions, "m"),
		n = cb.matrix(dimensions, "n"),
		multiplied = MatrixFactory.getMatrixMultiply(cb, m, n);

	cb.assign(out, multiplied);
	source.tab();
		cb.write(source, [cb.output(out)]);
	source.untab();
	return CodeBuilder.compile("multiply", ["out", "m", "n"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function map(dimensions) {
	var source = new SourceWriter(),
		cb = new CodeBuilder(),
		out = cb.vector(dimensions, "out"),
		m = cb.matrix(dimensions, "m"),
		v = cb.vector(dimensions, "v"),
		multiplied = MatrixFactory.getVectorMultiply(cb, m, v);

	cb.assign(out, multiplied);
	source.tab();
		cb.write(source, [cb.output(out)]);
	source.untab();
	return CodeBuilder.compile("map", ["out", "m", "v"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function determinant(dimensions) {
	var cb = new CodeBuilder(),
		m = cb.matrix(dimensions, "m"),
		det = MatrixFactory.getDeterminant(cb, m),
		source = new SourceWriter();
	source.tab();
		cb.write(source, [cb.output(det)]);
	source.untab();
	return CodeBuilder.compile("determinant", ["m"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function invert(dimensions) {
	var source = new SourceWriter(),
		cb = new CodeBuilder(),
		out = cb.matrix(dimensions, "out"),
		m = cb.matrix(dimensions, "m"),
		invert = MatrixFactory.getInvertMatrix(cb, m);
	cb.assign(out, invert);
	source.tab();
	cb.write(source, [cb.output(out)]);
	source.untab();
	return CodeBuilder.compile("invert", ["out", "m"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function adjoint(dimensions) {
	var source = new SourceWriter();

	source.tab();
	if (dimensions === 2) {
		source.writeln("if (out === m) {");
			var cb = new CodeBuilder(),
				out = cb.matrix(dimensions, "out");
			adjugate = MatrixFactory.getAdjointMatrix(cb, out);
			cb.assign(out, adjugate);
			cb.write(source, [cb.output(out)]);
		source.writeln("}");
	}
	var cb = new CodeBuilder(),
		out = cb.matrix(dimensions, "out"),
		adjugate = cb.matrix(dimensions, "m");
	adjugate = MatrixFactory.getAdjointMatrix(cb, adjugate);
	cb.assign(out, adjugate);
	cb.write(source, [cb.output(out)]);
	source.untab();
	return CodeBuilder.compile("adjoint", ["out", "m"], source.string, "Matrix" + dimensions + "x" + dimensions);
}

function transpose(dimensions) {
	var source = new SourceWriter();
	source.tab();
		source.writeln(`if (out === m) {`);
		{
			var cb = new CodeBuilder();
			var out = cb.matrix(dimensions, "out");
			cb.assign(out, MatrixFactory.getTransposeMatrix(cb, out));
			cb.write(source, [cb.output(out)]);
		}
		source.writeln("}");
		{
			var cb = new CodeBuilder();
			var out = cb.matrix(dimensions, "out");
			var m = cb.matrix(dimensions, "m");
			cb.assign(out, MatrixFactory.getTransposeMatrix(cb, m));
			cb.write(source, [cb.output(out)]);
		}
	source.untab();

	return CodeBuilder.compile("tranpose", ["out", "m"], source.string, "Matrix" + dimensions + "x" + dimensions);
}