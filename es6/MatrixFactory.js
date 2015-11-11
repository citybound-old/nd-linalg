var max = Math.max,
	sqrt = Math.sqrt;

import VectorFactory from "./VectorFactory.js";

export function getRow(cb, matrix, ri) {
	var dimensions = sqrt(matrix.length);
	var vector = [];
	for (var i = 0; i < dimensions; i++)
		vector[i] = matrix[ri * dimensions + i];
	return cb.vector(vector);
}

export function getColumn(cb, matrix, ci) {
	var dimensions = sqrt(matrix.length);
	var vector = [];
	for (var i = 0; i < dimensions; i++)
		vector[i] = matrix[i * dimensions + ci];
	return cb.vector(vector);
}

export function removeCell(cb, matrix, ci, ri) {
	var dimensions = sqrt(matrix.length);
	var m = new Array((dimensions - 1) * (dimensions - 1));
	var i = 0;
	for (let r = 0; r < dimensions; r++) {
		if (r === ri) continue;
		for (let c = 0; c < dimensions; c++) {
			if (c === ci) continue;
			m[i++] = matrix[r * dimensions + c];
		}
	}
	return cb.matrix(m);
}

export function getTransposeMatrix(cb, matrix) {
	var dimensions = sqrt(matrix.length);
	var m = new Array(dimensions * dimensions);
	for (let r = 0; r < dimensions; r++)
		for (let c = 0; c < dimensions; c++)
			m[c * dimensions + r] = matrix[r * dimensions + c];
	return cb.matrix(m);
}

export function getDeterminant(cb, matrix, flipSigning) {
	var dimensions = sqrt(matrix.length);
	if (dimensions === 2) {
		// matrix[0] * matrix[3] - matrix[1] * matrix[2]
		let a = cb.apply("*", matrix[0], matrix[3]),
			b = cb.apply("*", matrix[1], matrix[2]);
		return flipSigning
			 ? cb.apply("-", b, a)
			 : cb.apply("-", a, b);
	} else {
		var cofactors = new Array(dimensions);
		var negativeColumn = flipSigning ? 0 : 1;
		for (let i = 0; i < dimensions; i++) {
			let determinant = cb.apply("*", matrix[i], getDeterminant(cb, removeCell(cb, matrix, i, 0)));
			if (i % 2 == negativeColumn) determinant = cb.apply("[[negate]]", determinant);
			cofactors[i] = determinant;
		}
		return cb.apply.apply(cb, ["+"].concat(cofactors));
	}
}

export function getDeterminantSigningMatrix(dimensions) {
	let m = new Array(dimensions * dimensions);
	for (let r = 0; r < dimensions; r++) {
		let sign = r % 2 ? 1 : -1;
		for (let c = 0; c < dimensions; c++)
			m[r * dimensions + c] = (sign *= -1);
	}
	return m;
}

export function getCofactorMatrix(cb, matrix) {
	var dimensions = sqrt(matrix.length);
	if (dimensions === 2) {
		return [
			matrix[3], cb.apply("[[negate]]", matrix[2]),
			cb.apply("[[negate]]", matrix[1]), matrix[0]];
	}

	var cofactorMatrix = new Array(matrix.length),
		signings = getDeterminantSigningMatrix(dimensions);
	for (let r = 0; r < dimensions; r++) {
		for (let c = 0; c < dimensions; c++) {
			let negative = signings[r * dimensions + c] === -1,
				det = getDeterminant(cb, removeCell(cb, matrix, c, r), negative);
			cofactorMatrix[r * dimensions + c] = det;
		}
	}
	return cb.matrix(cofactorMatrix);
}

export function getAdjointMatrix(cb, matrix) {
	var cofactorMatrix = getCofactorMatrix(cb, matrix);
	return getTransposeMatrix(cb, cofactorMatrix);
}

export function getInvertMatrix(cb, matrix) {
	var determinant = getDeterminant(cb, matrix),
		zero = cb.scalar("0"),
		condition = [determinant, ">", zero],
		invdet = cb.phi(condition, cb.apply("1.0 /", determinant), zero, "invdet"),
		adjointMatrix = getAdjointMatrix(cb, matrix);
	return cb.map("*", adjointMatrix, invdet);
}

export function getMatrixMultiply(cb, a, b) {
	var dimensions = sqrt(a.length),
		output = new Array(dimensions * dimensions);
	for (let r = 0; r < dimensions; r++) {
		let row = getRow(cb, a, r);
		for (let c = 0; c < dimensions; c++) {
			let column = getColumn(cb, b, c);
			output[r * dimensions + c] = VectorFactory.dot(cb, row, column);
		}
	}
	return cb.matrix(output);
}

export function getVectorMultiply(cb, a, v) {
	var dimensions = v.length,
		output = new Array(dimensions);
	for (let r = 0; r < dimensions; r++) {
		let row = getRow(cb, a, r);
		output[r] = VectorFactory.dot(cb, row, v);
	}
	return cb.vector(output);
}

export function prettyprint(matrix) {
	var dimensions = sqrt(matrix.length);
	var rows = [];
	var strings = matrix.map(each => each.toString());
	var widths = strings.map(each => each.length);
	var maxwidth = 0;
	for (let each of widths)
		maxwidth = max(maxwidth, each);
	var padding = (new Array(maxwidth + 1)).join(" ");
	strings = strings.map(each => padding.slice(each.length) + each);
	for (let i = 0; i < matrix.length; i += dimensions)
		rows.push(strings.slice(i, i + dimensions).join(" "));
	return rows.join("\n");
}
