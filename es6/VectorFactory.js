let VectorFactory = exports;

let min =				(cb, a, b) =>	cb.map("Math.min", a, b),
	max =				(cb, a, b) =>	cb.map("Math.max", a, b),
	inverse =			(cb, a) =>		cb.map("1.0 /", a),
	negate =			(cb, a) =>		cb.map("[[negate]]", a),
	sum = 				(cb, a) => 		cb.reduce("+", a)[0],
	average =			(cb, a) =>		cb.apply("/", sum(cb, a), cb.scalar(a.length)),
	dot =				(cb, a, b) =>	sum(cb, cb.map("*", a, b)),
	squaredLength =		(cb, a) =>		dot(cb, a, a),
	length =			(cb, a)	=>		cb.apply("sqrt", squaredLength(cb, a)),
	wellFormed =        (cb, a) =>      cb.reduce("&&", cb.map("&&",
											cb.map("Number.isFinite", a),
											cb.map("!Number.isNaN", a)))[0],
	squaredDistance =	(cb, a, b) =>	squaredLength(cb, cb.map("-", b, a)),
	distance =			(cb, a, b) =>	cb.apply("sqrt", squaredDistance(cb, a, b)),
	roughlyEqual =		(cb, a, b, c) =>	cb.reduce("&&", cb.map(".isRoughly", a, b, c))[0],
	scaleAndAdd =		(cb, a, b, c) => cb.map("+", a, cb.map("*", b, c)),
	lerp =				(cb, a, b, c) => cb.map("+", a, cb.map("*", c, cb.map("-", b, a)));

function set(args) {
	return function(cb, out) {
		return args.map(each => cb.scalar(each));
	}
}

function operation(op) {
	return function operation(cb, a, b) {
		return cb.map(op, a, b);
	}
}

function normalize(cb, a) {
	// (||a||^2) > 0 ? a.(1/||a||) : 0
	let zero = cb.scalar("0"),
		condition = [squaredLength(cb, a), ">", zero],
		scalingLength = cb.phi(condition, cb.apply("1.0 /", length(cb, a)), zero, "length");
	return cb.map("*", a, scalingLength);
}

Object.defineProperties(VectorFactory, {
	"set": 				{value: set},
	"operation": 		{value: operation},
	"min": 				{value: min},
	"max": 				{value: max},
	"scaleAndAdd": 		{value: scaleAndAdd},
	"inverse": 			{value: inverse},
	"dot": 				{value: dot},
	"roughlyEqual": 	{value: roughlyEqual},
	"squaredLength": 	{value: squaredLength},
	"length": 			{value: length},
	"wellFormed":       {value: wellFormed},
	"squaredDistance": 	{value: squaredDistance},
	"distance": 		{value: distance},
	"negate": 			{value: negate},
	"sum": 				{value: sum},
	"average": 			{value: average},
	"normalize": 		{value: normalize},
	"lerp": 			{value: lerp}
});
