var Vector2 = function (x, y) {
	return Vector2.fromValues(x, y);
};
require("./Vector").create(2, Vector2);

let properties = {
	"crossz": 	                    {value: crossz},
	"cross": 	                    {value: cross},
	"perpendicular":                {value: perpendicular},
	"scalePerpendicularAndAdd":     {value: scalePerpendicularAndAdd},
	"angleBetween": 				{value: angleBetween},
	"angleBetweenWithDirections": 	{value: angleBetweenWithDirections},
	"rotate":                		{value: rotate}
}

Object.defineProperties(Vector2, properties);
module.exports = Vector2;

function crossz(a, b) {
	return a[0] * b[1] - b[0] * a[1];
}

function cross(output, a, b) {
	output[0] = 0;
	output[1] = 1;
	output[2] = crossz(a, b);
	return output;
}

function perpendicular(output, a) {
	output[0] = a[1];
	output[1] = -a[0];
	return output;
}

function scalePerpendicularAndAdd(output, a, b, scale) {
	output[0] = a[0] + b[1] * scale;
	output[1] = a[1] - b[0] * scale;
	return output;
}

function angleBetween(a, b) {
	var theta = Vector2.dot(a, b) / (Vector2.len(a) * Vector2.len(b));
	return Math.acos(theta.clamp(-1, 1));
}

function angleBetweenWithDirections(a, aDirection, b) {
	var simpleAngle = angleBetween(a, b);
	var linearDirection = Vector2.sub(Vector2.fromValues(0, 0), b, a);

	if (Vector2.dot(aDirection, linearDirection) >= 0) {
		return simpleAngle;
	} else {
		return 2 * Math.PI - simpleAngle;
	}
}

function rotate(out, v, angle) {
//	slow version:
//	return Matrix2x2.map(out, Matrix2x2.rotation(angle), v);

	var x = v[0], y = v[1],
		c = Math.cos(angle),
		s = Math.sin(angle);

	out[0] = c * x - s * y;
	out[1] = s * x + c * y;
	return out;
}
