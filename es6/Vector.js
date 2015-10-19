var VectorFactory = require("./VectorFactory");
var {SourceWriter, CodeBuilder} = require("code-builder");

var aliases = [
		"x", "y", "z", "w",
		"q", "r", "s", "t",
		"u", "v",
		"i", "j", "k", "l",
		"m", "n", "o", "p"];

export function create(dimensions, destination) {
	var createArray = new Array(dimensions);
	for (var i = 0; i < dimensions; i++) createArray[i] = 0.0;
	var createSource = `	return [${createArray.join(", ")}];`;
	var createFunction = CodeBuilder.compile("create", [], createSource, "Vector" + dimensions);

	var cloneSource = `	return out.slice();`;
	var cloneFunction = CodeBuilder.compile("clone", ["out"], cloneSource, "Vector" + dimensions);

	var decomposed = aliases.slice(0, dimensions);
	var fromSource = `	return [${decomposed.join(", ")}];`;
	var fromFunction = CodeBuilder.compile("fromSource", decomposed, fromSource, "Vector" + dimensions);
	var averageFunction = function (out, iterable) {
		destination.set(out, 0, 0);
		let n = 0;
		for (let vector of iterable) {
			destination.add(out, out, vector);
			n++;
		}
		return destination.scale(out, out, 1 / n);
	};

	var properties = {
		"create": 		{value: createFunction},
		"clone": 		{value: cloneFunction},
		"fromValues": 	{value: fromFunction},
		"average":      {value: averageFunction}
	};

	Object.defineProperties(destination, properties);
	//Object.defineProperties(fromFunction, properties);

	var operations = {
		"copy":
			{"function": (cb, a) => a,
			 "arguments": ["out", "a"],
			 "types": ["vector", "vector"]},
		"set":
			{"function": VectorFactory.set(aliases.slice(0, dimensions)),
			 "arguments": ["out"].concat(aliases.slice(0, dimensions)),
			 "types": aliases.slice(0, dimensions + 1).map(each => "vector")},

		"add":
			{"function": VectorFactory.operation("+"),
			 "arguments": ["out", "a", "b"],
			 "types": ["vector", "vector", "vector"]},
		"sub":
		 	{"function": VectorFactory.operation("-"),
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "vector"]},
		"mul":
		 	{"function": VectorFactory.operation("*"),
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "vector"]},
		"div":
		 	{"function": VectorFactory.operation("/"),
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "vector"]},
		"min":
		 	{"function": VectorFactory.min,
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "vector"]},
		"max":
		 	{"function": VectorFactory.max,
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "vector"]},

		"scale":
		 	{"function": VectorFactory.operation("*"),
		 	 "arguments": ["out", "a", "b"],
		 	 "types": ["vector", "vector", "scalar"]},
		"scaleAndAdd":
		 	{"function": VectorFactory.scaleAndAdd,
		 	 "arguments": ["out", "a", "b", "c"],
		 	 "types": ["vector", "vector", "vector", "scalar"]},
		"lerp":
		 	{"function": VectorFactory.lerp,
		 	 "arguments": ["out", "a", "b", "t"],
		 	 "types": ["vector", "vector", "vector", "scalar"]},

		"negate":
		 	{"function": VectorFactory.negate,
		 	 "arguments": ["out", "a"],
		 	 "types": ["vector", "vector"]},
		"inverse":
		 	{"function": VectorFactory.inverse,
		 	 "arguments": ["out", "a"],
		 	 "types": ["vector", "vector"]},
		"normalize":
		 	{"function": VectorFactory.normalize,
		 	 "arguments": ["out", "a"],
		 	 "types": ["vector", "vector"]},

		"dot":
		 	{"function": VectorFactory.dot,
		 	 "arguments": ["a", "b"],
		 	 "types": ["vector", "vector"]},
		"roughlyEqual":
			{"function": VectorFactory.roughlyEqual,
			"arguments": ["a", "b", "epsilon"],
			"types": ["vector", "vector", "scalar"]},
		"wellFormed":
			{"function": VectorFactory.wellFormed,
			"arguments": ["a"],
			"types": ["vector"]},
		"squaredLength":
		 	{"function": VectorFactory.squaredLength,
		 	 "arguments": ["a"],
		 	 "types": ["vector"]},
		"len":
		 	{"function": VectorFactory.length,
		 	 "arguments": ["a"],
		 	 "types": ["vector"]},
		"squaredDistance":
		 	{"function": VectorFactory.squaredDistance,
		 	 "arguments": ["a", "b"],
		 	 "types": ["vector", "vector"]},
		"dist":
		 	{"function": VectorFactory.distance,
		 	 "arguments": ["a", "b"],
		 	 "types": ["vector", "vector"]},
		"sum":
			{"function": VectorFactory.sum,
			 "arguments": ["a"],
			 "types": ["vector"]}
	};

	for (let operationName in operations) {
		let cb = new CodeBuilder(),
			source = new SourceWriter(),
			operation = operations[operationName],
			args = [];

		cb.temporariesPool = aliases.slice();

		let output = operation["arguments"][0] == "out";
		for (let i = (output ? 1 : 0); i < operation["arguments"].length; i++) {
			let name = operation["arguments"][i],
				type = operation["types"][i];
			switch(type) {
				case "scalar":
					args.push(cb.scalar(name));
					break;
				case "vector":
					args.push(cb.vector(dimensions, name));
					break;
				default:
					throw "Unknown type for function argument";
			}
		}

		let body = operation["function"].apply(null, [cb].concat(args));
		if (output) body = cb.assign(cb.vector(dimensions, "out"), body);
		body = cb.output(body);

		source.tab();
			cb.write(source, [body]);
		source.untab();

		let compiled = CodeBuilder.compile(operationName, operation["arguments"], source.string, "Vector" + dimensions);
		//fromFunction[operationName] || Object.defineProperty(fromFunction, operationName, {value: compiled});
		destination[operationName] || Object.defineProperty(destination, operationName, {value: compiled});
	}
}
