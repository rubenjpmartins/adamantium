// based on:
//   https://github.com/ethereumjs/rlp/raw/3122e47f7c2ff2c7efa67acfeabe02a5f3a3670a/index.js

/**
 * RLP Encoding based on: https://github.com/ethereum/wiki/wiki/%5BEnglish%5D-RLP
 * This function takes in a data, convert it to buffer if not, and a length for recursion
 *
 * @param {Buffer,String,Integer,Array} data - will be converted to buffer
 * @returns {Buffer} - returns buffer of encoded data
 **/
 export function encode (input) {
    if (input instanceof Array) {
      var output = []
      for (var i = 0; i < input.length; i++) {
        output.push(encode(input[i]))
      }
      var buf = Buffer.concat(output)
      return Buffer.concat([encodeLength(buf.length, 192), buf])
    } else {
      input = toBuffer(input)
      if (input.length === 1 && input[0] < 128) {
        return input
      } else {
        return Buffer.concat([encodeLength(input.length, 128), input])
      }
    }
  }
  
  export function safeParseInt (v, base) {
    if (v.slice(0, 2) === '00') {
      throw (new Error('invalid RLP: extra zeros'))
    }
  
    return parseInt(v, base)
  }
  
  export function encodeLength (len, offset) {
    if (len < 56) {
      return new Buffer([len + offset])
    } else {
      var hexLength = intToHex(len)
      var lLength = hexLength.length / 2
      var firstByte = intToHex(offset + 55 + lLength)
      return new Buffer(firstByte + hexLength, 'hex')
    }
  }
  
  export function isHexPrefixed (str) {
    return str.slice(0, 2) === '0x'
  }
  
  // Removes 0x from a given String
  export function stripHexPrefix (str) {
    if (typeof str !== 'string') {
      return str
    }
    return isHexPrefixed(str) ? str.slice(2) : str
  }
  
  // Removes leading zeros from: Buffer, Array, or String
  export function stripZeros (a) {
    a = stripHexPrefix(a)
    var first = a[0]
    while (a.length > 0 && first.toString() === '0') {
      a = a.slice(1)
      first = a[0]
    }
    return a
  }
  
  export function intToHex (i) {
    var hex = i.toString(16)
    if (hex.length % 2) {
      hex = '0' + hex
    }
  
    return hex
  }
  
  export function padToEven (a) {
    if (a.length % 2) a = '0' + a
    return a
  }
  
  export function intToBuffer (i) {
    var hex = intToHex(i)
    return new Buffer(hex, 'hex')
  }
  
  export function toBuffer (v) {
    if (!Buffer.isBuffer(v)) {
      if (Array.isArray(v)) {
        v = Buffer.from(v)
      } else if (typeof v === 'string') {
        if (isHexPrefixed(v)) {
          v = Buffer.from(padToEven(stripHexPrefix(v)), 'hex')
        } else {
          v = Buffer.from(v)
        }
      } else if (typeof v === 'number') {
        v = intToBuffer(v)
      } else if (v === null || v === undefined) {
        v = Buffer.allocUnsafe(0)
      } else if (v.toArray) {
        // converts a BN to a Buffer
        v = Buffer.from(v.toArray())
      } else {
        throw new Error('invalid type')
      }
    }
    return v
  }
  
  export function bufferToHex (buf, add_prefix=true) {
    buf = toBuffer(buf)
    if ((! buf) || (buf.length === 0))
      return ''
    else
      return (add_prefix ? '0x' : '') + buf.toString('hex')
  }
  
  export function bufferToInt (buf) {
    return parseInt(bufferToHex(buf), 16)
  }
