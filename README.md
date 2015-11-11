# nd-linalg

[![experimental](http://badges.github.io/stability-badges/dist/experimental.svg)](http://github.com/badges/stability-badges)

Efficient, unrolled, any-dimensional vector and matrix operations (based on code-builder)

## Purpose

A fast vector and matrix math library akin to [glMatrix](https://github.com/toji/gl-matrix), but using metaprogramming instead of being handwritten.
Can be trivially be extended to support more than 3 dimensions

## Usage Example

```javascript
import {Vector2 as vec2} from 'nd-linalg';

const position = vec2(3, 18);
const fiveMetersToTheRight = vec2(5, 0);
const newPosition = vec2(0, 0);

// first argument is always 'out' argument
vec2.add(newPosition, position, fiveMetersToTheRight);

console.log(newPosition);
// => [8, 18]

```

## Contribution

Goals, wishes and bugs are managed as GitHub Issues - if you want to help, have a look there and submit your work as pull requests.
Your help is highly welcome! :)

## License

MIT, see [LICENSE.md](http://github.com/citybound/nd-linalg/blob/master/LICENSE.md) for details.
