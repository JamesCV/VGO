var _buffer = null;
if (typeof(Buffer.from) === 'function') {
  // Some older Node versions throw an exception when 
  // buffers with binary encoding are created using the
  // from function, so if that happens we have to resort
  // to constructor based creation.
  try {
    Buffer.from('openid', 'binary');
    _buffer = Buffer.from;
  }
  catch(_) {
  }
}
if (_buffer === null) {
  // Either the Node version is too old to have a Buffer.from,
  // or the Buffer.from call failed with binary encoding.
  // Either way, use the (deprecated from node v6) constructor.
  _buffer = function(str, enc) { return new Buffer(str, enc); };
} 

_buffer('hello', 'binary');
