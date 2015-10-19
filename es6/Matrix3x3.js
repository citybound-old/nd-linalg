var Matrix3x3 = exports;

require("./Matrix").create(3, Matrix3x3);
Object.defineProperties(Matrix3x3, {
	"rotation": 	{value: rotation},
	"translation": 	{value: translation}
});

// http://en.wikipedia.org/wiki/Transformation_matrix
function rotation(angle, axis) {
	vec3.normalize(axis, axis);
	let c = Math.cos(angle), c1 = 1 - c,
		s = Math.sin(angle), s1 = 1 - s,
		t = vec3.scale(vec3(0, 0, 0), axis, 1 - c);
	return [axis[0] * t[0] + c,
			axis[1] * t[0] - s * axis[2],
			axis[2] * t[0] + s * axis[1],

			axis[0] * t[1] + c * axis[2],
			axis[1] * t[1] + c,
			axis[2] * t[1] - s * axis[0],

			axis[0] * t[2] - s * axis[1],
			axis[1] * t[2] + s * axis[0],
			axis[2] * t[2] + c];
}

function translation(t) {
	return [1, 0, t[0],
			0, 1, t[1],
			0, 0, 1];
}
