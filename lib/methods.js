const crypto = require('crypto');

const b1Lib = {
    /**
     * 
     * @param {number} n Number of digits lengtth of code
     * @returns Strting with the code generated
     */
    generate(n) {
        let num = ''
        for (let x = 1; x <= n; x++) {
            num += crypto.randomInt(10).toString()
        }
        return num
    }
}

module.exports = {b1Lib}