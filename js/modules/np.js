const NpDataType = Object.freeze({
    Int8: "Int8",
    Uint8: "Uint8",
    Uint8Clamped: "Uint8Clamped",
    Int16: "Int16",
    Uint16: "Uint16",
    Int32: "Int32",
    Uint32: "Uint32",
    Float16: "Float16",
    Float32: "Float32",
    Float64: "Float64",
    BigInt64: "BigInt64",
    BigUint64: "BigUint64"
})

const int8 = "Int8"
const uint8 = "Uint8"
const uint8Clamped = "Uint8Clamped"
const int16 = "Int16"
const uint16 = "Uint16"
const int32 = "Int32"
const uint32 = "Uint32"
const float16 = "Float16"
const float32 = "Float32"
const float64 = "Float64"
const bigInt64 = "BigInt64"
const bigUint64 = "BigUint64"

const NpAllDataTypes = new Set(Object.keys(NpDataType))

function* iterateShape(shape) {
    const totalSize = shape.reduce((p, c) => p * c, 1)
    const shapeIndeces = shape.map(() => 0)
    for (let i = 0; i < totalSize; i++) {
        let t = i
        for (let j = 0; j < shape.length; j++) {
            const shapeIndex = shape.length - j - 1
            shapeIndeces[shapeIndex] = t % shape[shapeIndex]
            t = (t - shapeIndeces[shapeIndex]) / shape[shapeIndex]
        }
        yield shapeIndeces
    }
}

class NpArray {

    constructor(arrayData, dtype=null) {
        // make sure initialization is correct
        dtype ??= float64
        if (!NpAllDataTypes.has(dtype)) {
            throw new TypeError(`data type '${dtype}' not understood`)
        }

        if (!Array.isArray(arrayData)) {
            throw new TypeError("expected arrayData to be an array")
        }

        // find shape of data
        this.shape = []
        let tempData = arrayData
        while (Array.isArray(tempData)) {
            this.shape.push(tempData.length)
            tempData = tempData[0]
        }

        // initialize 1d array representing NpArray
        const totalSize = this.shape.reduce((p, c) => p * c, 1)
        const relevantClass = terminal.window[dtype + "Array"]
        this._data = new relevantClass(totalSize)

        // fill data
        let i = 0
        for (const shapeIndeces of iterateShape(this.shape)) {
            // use shapeIndeces to locate value
            let value = arrayData
            for (const shapeIndex of shapeIndeces) {
                if (!Array.isArray(value)) {
                    throw new Error("arrayData has invalid shape: must be (hyper-)rectangular")
                }

                value = value[shapeIndex]
            }

            // check if it even exists
            if (value === undefined) {
                throw new Error("arrayData has invalid shape: must be (hyper-)rectangular")
            }

            // fill value in array
            this._data[i] = value
            i++
        }
    }

    *[Symbol.iterator]() {
        for (let i = 0; i < this.size; i++) {
            yield this._data[i]
        }
    }

    get size() {
        return this._data.length
    }

    at(...indeces) {
        if (indeces.length > this.shape.length) {
            throw new Error("got too many indeces")
        } else if (indeces.length == this.shape.length) {
            let totalIndexSum = 0
            let cumulativeFactor = 1
            for (let i = 0; i < this.shape.length; i++) {
                const shapeSize = this.shape[this.shape.length - i - 1]
                const givenIndex = indeces[this.shape.length - i - 1]
                if (!Number.isInteger(givenIndex)) {
                    throw new Error("expected integers as indeces")
                }
                
                const realIndex = mod(givenIndex, shapeSize)
                totalIndexSum += realIndex * cumulativeFactor
                console.log(realIndex, shapeSize)
                cumulativeFactor *= shapeSize
            }
            return this._data[totalIndexSum]
        } else {
            throw new Error("Not Implemented")
        }
    }

    toString() {
        let outstring = "array("
        for (let i = 0; i < this.size; i++) {
            for (const shapeSize of this.shape) {
                if (i % shapeSize == 0) {
                    outstring += "."
                }
            }
            outstring += `${this._data[i]}`
        }
        return outstring
    }

    static isNpArray(data) {
        if (data instanceof NpArray) {
            return true
        } else {
            return false
        }
    }

    get _val() {
        if (this.size > 1) {
            throw new Error("Can't get value of multivalued array")
        }
        return this._data[0]
    }

}

function array(data, dtype=null) {
    return new NpArray(data, dtype)
}

function asarray(data, dtype=null) {
    if (NpArray.isNpArray(data)) {
        return data
    } else if (Array.isArray(data)) {
        return new NpArray(data, dtype)
    } else if (typeof data === "number") {
        return new NpArray([data], dtype)
    } else {
        throw new Error("Unable to convert data to array")
    }
}

function mod(n, modulus) {
    return ((n % modulus) + modulus) % modulus
}

terminal.modules.np = {
    NpArray, NpDataType, NpAllDataTypes, array,
    asarray, mod, iterateShape,
    int8,
    uint8,
    uint8Clamped,
    int16,
    uint16,
    int32,
    uint32,
    float16,
    float32,
    float64,
    bigInt64,
    bigUint64,
}