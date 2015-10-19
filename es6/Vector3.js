var Vector3 = exports;

require("./Vector").create(3, Vector3);
Object.defineProperties(Vector3, {
	"cross": 	{value: cross}
});
//Object.defineProperties(Vector3.fromValues, {
//	"cross": 	{value: cross}
//});

function cross(output, a, b) {
	var ax = a[0], ay = a[1], az = a[2],
		bx = b[0], by = b[1], bz = a[2];

	output[0] = ay * bz - az * by;
	output[1] = az * bx - ax * bz;
	output[2] = ax * by - ay * bx;
	return output;
}
