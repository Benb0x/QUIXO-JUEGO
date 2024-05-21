const { TextEncoder, TextDecoder } = require('util');

// Polyfill para TextEncoder y TextDecoder
if (typeof global.TextEncoder === 'undefined') {
  global.TextEncoder = TextEncoder;
}

if (typeof global.TextDecoder === 'undefined') {
  global.TextDecoder = TextDecoder;
}