function toCharCodes(text) {
    return text.split('').map(letter => letter.charCodeAt(0))
}

function toText(charCodes) {
    return String.fromCharCode(...charCodes)
}

function XOR(code1, code2) {
    return code1.map((_, ind) => code1[ind] ^ code2[ind])
}

function toHex(num, padding) {
    let hex = num.toString(16).toUpperCase()
    if (padding && padding >= 0) hex = hex.padStart(padding, '0')
    return hex
}

function toDen(str) {
    return parseInt(str, 16)
}

function encrypt(key, hashKey) {
    let cypherKey = ''
    let checkDigit = ''
    let keyCodes = toCharCodes(key)
    let hashKeyCodes = toCharCodes(hashKey)
    let result = XOR(keyCodes, hashKeyCodes)
    cypherKey = result.map(n => toHex(n, 2)).join('')
    checkDigit = toHex(result.reduce((a, b) => a + b) % 16)
    cypherKey += checkDigit
    return cypherKey
}