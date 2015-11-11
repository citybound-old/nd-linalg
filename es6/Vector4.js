var Vector4 = function (x, y, z, w) {
	return Vector4.fromValues(x, y, z, w);
};

require("./Vector").create(4, Vector4);
Object.defineProperties(Vector4, {
});
module.exports = Vector4;