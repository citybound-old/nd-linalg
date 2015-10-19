var Matrix4x4 = exports;

require("./Matrix").create(4, Matrix4x4);
Object.defineProperties(Matrix4x4, {
	"rotation": 	{value: rotation},
	"translation": 	{value: translation},
	"frustrum": 	{value: frustrum},
	"orthogonal": 	{value: orthogonal},
	"perspective": 	{value: perspective},
	"lookAt": 		{value: lookAt}
});

function rotation(angle, axis) {
	vec3.normalize(axis, axis);
	let c = cos(angle),
		s = sin(angle),
		t = vec3.scale(vec3(0, 0, 0), axis, 1 - c);
	return [axis[0] * t[0] + c,
			axis[1] * t[0] - s * axis[2],
			axis[2] * t[0] + s * axis[1],
			0,

			axis[0] * t[1] + c * axis[2],
			axis[1] * t[1] + c,
			axis[2] * t[1] - s * axis[0],
			0,

			axis[0] * t[2] - s * axis[1],
			axis[1] * t[2] + s * axis[0],
			axis[2] * t[2] + c,
			0,

			0, 0, 0, 1];
}

function translation(t) {
	return [1, 0, 0, t[0],
			0, 1, 0, t[1],
			0, 0, 1, t[2],
			0, 0, 0, 1];
}

function frustrum(l, r, t, b, n, f) {
	let w = r - l,
		h = t - b,
		d = f - n;
	return [2 * n / w, 0, (r + l) / w, 0,
			0, 2 * n / h, (t + b) / h, 0,
			0, 0, -(f + n) / d, -2 * f * n / d,
			0, 0, -1, 0];
}

function orthogonal(l, r, t, b, n, f) {
	return [2 / (r - l), 0, 0, -((r + l) / (r - l)),
			0, 2 / (t - b), 0, -((t + b) / (t - b)),
			0, 0, -2 / (f - n), ((f + n) / (f - n)),
			0, 0, 0, 1];
}

function perspective(fovy, aspect, n, f) {
	var f = 1 / Math.tan(fovy / 2);
	return [f / aspect, 0, 0, 0,
			0, f, 0, 0,
			0, 0, (n + f) / (n - f), 2 * n * f / (n - f),
			0, 0, -1, 0];
}

function lookAt(from, to, up) {
	var f = vec3.subtract(vec3(0, 0, 0), to, from);
	vec3.normalize(f, f);
	var s = vec3.cross(vec3(0, 0, 0), f, up);
	vec3.normalize(s, s);
	var u = vec3.cross(vec3(0, 0, 0), s, f);
	f = -f;
	var look = [s[0], s[1], s[2], 0,
				u[0], u[1], u[2], 0,
				f[0], f[1], f[2], 0,
				0, 0, 0, 1];
	var negfrom = vec3.negate(vec3.create(0, 0, 0), from);
	return Matrix4x4.multiply(Matrix4x4.create(), look, translation(negfrom));
}
