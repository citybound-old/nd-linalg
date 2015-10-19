var Matrix2x2 = exports;

require("./Matrix").create(2, Matrix2x2);
Object.defineProperties(Matrix2x2, {
	"rotation": {value: rotation},
	"shear": 	{value: shear}
});

function rotation(angle) {
	let c = Math.cos(angle),
		s = Math.sin(angle)
	return [c, -s,
			s,  c];
}

function shear(k) {
	return [1, 0,
			k, 1];
}