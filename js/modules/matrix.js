const MatrixCellType = {
    Numeric: 0,
    Expression: 1
}

class MatrixCell {

    constructor(value) {
        this.value = value
    }

    get type() {
        return (typeof this.value === "number") ? MatrixCellType.Numeric : MatrixCellType.Expression
    }

    static toMatrixCell(object) {
        if (object instanceof MatrixCell) {
            return object
        } else {
            return new MatrixCell(object)
        }
    }

    static get Default() {
        return new MatrixCell(0)
    }

    toString() {
        return this.value.toString()
    }

    toSimplifiedString() {
        if (this.type != MatrixCellType.Numeric) {
            return this.toString()
        }

        if (Number.isInteger(this.value)) {
            return this.value.toString()
        }

        if (this.value == 0) {
            return "0"
        }

        // find fraction approximation (very inefficiently!)
        // only works for denominator < 10000

        let bestFraction = null
        let bestError = Infinity
        let bestNumerator = null
        let bestDenominator = null
        for (let denominator = 1; denominator < 10000; denominator++) {
            let numerator = Math.round(this.value * denominator)
            const newValue = numerator / denominator
            
            const error = Math.abs(this.value - newValue)

            if (error == 0) {
                return `${numerator}/${denominator}`
            }

            if (error < bestError) {
                bestError = error
                bestFraction = `${numerator}/${denominator}`
                bestNumerator = numerator
                bestDenominator = denominator
            }
        }

        if (bestNumerator == 0) {
            return "0"
        }

        if (bestDenominator == 1) {
            return bestNumerator.toString()
        }

        return bestFraction
    }

    _arithmeticFunc(other, f, templateString) {
        other = MatrixCell.toMatrixCell(other)
        if (this.type == MatrixCellType.Numeric && other.type == MatrixCellType.Numeric) {
            return new MatrixCell(f(this.value, other.value))
        } else {
            let str = `(${templateString})`
                .replace("$1", this.value)
                .replace("$2", other.value)
            console.log(str)
            return new MatrixCell(str)
        } 
    }

    mul(other) {
        return this._arithmeticFunc(other, (x, y) => x * y, "$1*$2")
    }

    add(other) {
        return this._arithmeticFunc(other, (x, y) => x + y, "$1+$2")
    }

    sub(other) {
        return this._arithmeticFunc(other, (x, y) => x - y, "$1-$2")
    }

    div(other) {
        return this._arithmeticFunc(other, (x, y) => x / y, "$1/$2")
    }

    copy() {
        return new MatrixCell(this.value)
    }

    simplify(steps=100) {
        if (this.type == MatrixCellType.Numeric) {
            return this.copy()
        }

        let newValue = this.value

        if (this.type == MatrixCellType.Expression) {
            for (let i = 0; i < steps; i++) {
                newValue = newValue
                    .replaceAll("0+", "")
                    .replaceAll("+0", "")
                    .replaceAll("+-", "-")
                    .replaceAll("--", "+")
                    .replaceAll(/([a-zA-Z])\*-1/g, "-$1")
                    .replaceAll(/-1\*([a-zA-Z])/g, "-$1")
                    .replaceAll(/\(([a-zA-Z])\*1\)/g, "$1")
                    .replaceAll(/\(1\*([a-zA-Z])\)/g, "$1")
                    .replaceAll(/\(([a-zA-Z])\*0\)/g, "0")
                    .replaceAll(/\(0\*([a-zA-Z])\)/g, "0")
                    .replaceAll(/\(([a-zA-Z0-9])\)/g, "$1")
                    .replaceAll(/\(\(([a-zA-Z])\*([a-zA-Z])\)\*([a-zA-Z])\)/g, "($1*$2*$3)")
                    .replaceAll(/\(([a-zA-Z])\*\(([a-zA-Z])\*([a-zA-Z])\)\)/g, "($1*$2*$3)")
                    .replaceAll(/\(\(([a-zA-Z])\+([a-zA-Z])\)\+([a-zA-Z])\)/g, "($1*$2*$3)")
                    .replaceAll(/\(([a-zA-Z])\+\(([a-zA-Z])\+([a-zA-Z])\)\)/g, "($1*$2*$3)")
            }
        }

        return new MatrixCell(newValue)
    }

}

class MatrixDimensions {

    constructor(rows, columns) {
        this.rows = rows
        this.columns = columns
    }

    transpose() {
        return new MatrixDimensions(this.columns, this.rows)
    }

    add(n) {
        return new MatrixDimensions(
            this.rows + n,
            this.columns + n
        )
    }

    copy() {
        return new MatrixDimensions(this.rows, this.columns)
    }

    static get Undefined() {
        return new MatrixDimensions(undefined, undefined)
    }

    toString() {
        return `${this.rows}x${this.columns}`
    }

    get isSquare() {
        return this.rows == this.columns
    }

    equals(otherDimensions) {
        return this.rows == otherDimensions.rows && this.columns == otherDimensions.columns
    }

}

class Matrix {

    constructor(dimensions, arrayData=undefined) {
        this.dimensions = dimensions

        this._data = Array.from({length: dimensions.rows},
            () => Array.from({length: dimensions.columns}, () => MatrixCell.Default))

        if (Array.isArray(arrayData)) {
            for (let i = 0; i < arrayData.length; i++) {
                if (Array.isArray(arrayData[i])) {
                    for (let j = 0; j < arrayData[i].length; j++) {
                        if (i < this._data.length && j < this._data[i].length && arrayData[i][j] !== undefined) {
                            this._data[i][j].value = arrayData[i][j]
                        }
                    }
                }
            }
        }
    }

    static fromArray(arr) {
        const dimensions = new MatrixDimensions(arr.length, arr[0].length)
        return new Matrix(dimensions, arr)
    }

    get nRows() {
        return this.dimensions.rows
    }

    get nCols() {
        return this.dimensions.columns
    }

    get(rowIndex, columnIndex) {
        return this._data[rowIndex][columnIndex].value
    }

    set(rowIndex, columnIndex, value) {
        this._data[rowIndex][columnIndex].value = value
    }

    setCell(rowIndex, columnIndex, cell) {
        if (!(cell instanceof MatrixCell)) {
            throw new Error("cell must be instance of MatrixCell")
        }

        this._data[rowIndex][columnIndex] = cell
    }

    setCellValue(rowIndex, columnIndex, value) {
        this._data[rowIndex][columnIndex].value = value
    }

    getCell(rowIndex, columnIndex) {
        return this._data[rowIndex][columnIndex]
    }

    getCellValue(rowIndex, columnIndex) {
        return this._data[rowIndex][columnIndex].value
    }

    get rows() {
        return this._data
    }

    get rowsValues() {
        return this._data.map(
            row => row.map(
                cell => cell.value
            )
        )
    }

    get columns() {
        return Array.from({length: this.dimensions.columns}, (_, ci) => this.getColumn(ci))
    }

    get columnsValues() {
        return this.columns.map(
            column => column.map(
                cell => cell.value
            )
        )
    }

    toStringArray() {
        return this._data.map(
            row => row.map(
                element => {
                    if (typeof element.value === "number") {
                        return element.toSimplifiedString()
                    }
                    return element.toString()
                }
            )
        )
    }

    getColumn(i) {
        return this.rows.map(row => row[i])
    }

    getRow(i) {
        return this._data[i]
    }

    toString() {
        let stringArray = this.toStringArray()
        const getColumnWidth = ci => Math.max(...stringArray.map(row => row[ci].length))
        const columnWidths = Array.from({length: this.dimensions.columns}, (_, ci) => getColumnWidth(ci))

        const padMiddle = (str, length) => {
            if (str.length >= length) return str
            let padLength = length - str.length
            let half = Math.floor(padLength / 2)
            return " ".repeat(half) + str + " ".repeat(padLength - half)
        }

        let outString = ""
        for (let ri = 0; ri < this.dimensions.rows; ri++) {
            outString += "[ "
            for (let ci = 0; ci < this.dimensions.columns; ci++) {
                outString += padMiddle(stringArray[ri][ci], columnWidths[ci])
                outString += " "
            }
            outString = outString.slice(0, -1) + " ]\n"
        }

        return outString.slice(0, -1)
    }

    multiply(other) {
        let result = new Matrix(new MatrixDimensions(
            this.dimensions.rows, other.dimensions.columns))
        for (let ri = 0; ri < result.dimensions.rows; ri++) {
            for (let ci = 0; ci < result.dimensions.columns; ci++) {
                let row = this.getRow(ri)
                let column = other.getColumn(ci)

                let dotProduct = row.map((n, i) => n.mul(column[i]))
                    .reduce((p, c) => p.add(c))
                result.setCell(ri, ci, dotProduct)
            }
        }
        return result
    }

    transpose() {
        return new Matrix(this.dimensions.transpose(), this.columnsValues)
    }

    without(rowIndex, columnIndex) {
        const result = new Matrix(this.dimensions.add(-1))

        for (let i = 0; i < this.dimensions.rows; i++) {
            for (let j = 0; j < this.dimensions.columns; j++) {
                if (i == rowIndex || j == columnIndex) {
                    continue
                }

                let newRowIndex = i
                let newColumnIndex = j

                if (i > rowIndex) {
                    newRowIndex--
                }

                if (j > columnIndex) {
                    newColumnIndex--
                }

                result._data[newRowIndex][newColumnIndex] = this._data[i][j]
            }   
        }

        return result
    }

    get isSquare() {
        return this.dimensions.isSquare
    }

    get n() {
        return this.dimensions.rows
    }

    determinant() {
        if (!this.isSquare) {
            throw new Error("Determinant is undefined for non-square matrices")
        }

        if (this.n == 1) {
            return this._data[0][0]
        }

        let sum = new MatrixCell(0)

        for (let j = 0; j < this.n; j++) {
            const sgn = new MatrixCell((j % 2 == 0) ? 1 : -1)
            sum = sum.add(this.getCell(0, j).mul(sgn).mul(this.without(0, j).determinant()))
        }

        return sum
    }

    mapValue(mapFunc) {
        const result = new Matrix(this.dimensions.copy())
        for (let i = 0; i < result.dimensions.rows; i++) {
            for (let j = 0; j < result.dimensions.columns; j++) {
                result._data[i][j].value = mapFunc(this.getCell(i, j), i, j)
            }
        }
        return result
    }

    map(mapFunc) {
        const result = new Matrix(this.dimensions.copy())
        for (let i = 0; i < result.dimensions.rows; i++) {
            for (let j = 0; j < result.dimensions.columns; j++) {
                result._data[i][j] = mapFunc(this.getCell(i, j), i, j)
            }
        }
        return result
    }

    static RandomIntegers(n, m, maxInt=10) {
        if (m === undefined) {
            m = n
        }

        return new Matrix(new MatrixDimensions(n, m)).mapValue(
            () => Math.floor(Math.random() * maxInt)
        )
    }

    minors() {
        return this.map((cell, i, j) => {
            return this.without(i, j).determinant()
        })
    }

    cofactor() {    
        return this.minors().map((cell, i, j) => {
            return cell.mul(new MatrixCell(((i + j) % 2 == 0) ? 1 : -1))
        })
    }

    adjunct() {
        return this.cofactor().transpose()
    }

    inverse() {
        const det = this.determinant()
        if (det == 0) {
            throw new Error("Matrix is not invertible (det = 0)")
        }

        return this.adjunct().scale(new MatrixCell(1).div(det))
    }

    simplify() {
        return this.map(cell => cell.simplify())
    }

    add(otherMatrix) {
        if (!this.dimensions.equals(otherMatrix.dimensions)) {
            return new Error("Matrix Dimensions must be equal")
        }

        return this.map((cell, i, j) => {
            return cell.add(otherMatrix.getCell(i, j))
        })
    }

    scale(scalar) {
        return this.map(cell => {
            return cell.mul(MatrixCell.toMatrixCell(scalar))
        })
    }

    // row operations (inplace)

    swapRows(r1, r2) {
        const temp = this._data[r1]
        this._data[r1] = this._data[r2]
        this._data[r2] = temp
    }

    scaleRow(rowIndex, scalar) {
        const scalarCell = MatrixCell.toMatrixCell(scalar)
        for (let columnIndex = 0; columnIndex < this.nCols; columnIndex++) {
            const newCell = this.getCell(rowIndex, columnIndex).mul(scalarCell)
            this.setCell(rowIndex, columnIndex, newCell)
        }
    }

    addScalarRow(r1, r2, scalar) {
        const scalarCell = MatrixCell.toMatrixCell(scalar)
        for (let columnIndex = 0; columnIndex < this.nCols; columnIndex++) {
            const newCell = this.getCell(r2, columnIndex).add(this.getCell(r1, columnIndex).mul(scalarCell))
            this.setCell(r2, columnIndex, newCell)
        }
    }

    isZeroColumn(columnIndex) {
        for (let i = 0; i < this.nRows; i++) {
            if (this.get(i, columnIndex) != 0) {
                return false
            }
        }
        return true
    }

    isZeroMatrix() {
        for (let i = 0; i < this.nCols; i++) {
            if (!this.isZeroColumn(i)) {
                return false
            }
        }
        return true
    }

    containsOnlyNumbers() {
        return !this._data.flat().some(cell => cell.type != MatrixCellType.Numeric)
    }

}

async function inputMatrixDimensions({
    matrixName="A",
    forcedRows=undefined,
    square=false
}={}) {
    let message = `Matrix ${matrixName} Dimensions [e.g. 3x2]: `
    if (forcedRows) {
        message += `${forcedRows}x`
    }

    if (square) {
        while (true) {
            const input = await terminal.prompt(`Matrix ${matrixName} size: `)
            if (/^[0-9]+$/.test(input)) {
                const n = parseInt(input)
                return new MatrixDimensions(n, n)
            } else {
                terminal.printError("Invalid Format! Valid format is positive integer, e.g. \"3\"", "ParserError")
            }
        }
    }

    while (true) {
        const input = await terminal.prompt(message)
        if (forcedRows === undefined) {
            if (/^[0-9]+x[0-9]+$/.test(input)) {
                const splitValues = input.split("x").map(v => parseInt(v))
                if (Math.min(...splitValues) == 0) {
                    terminal.printError("Dimensions must be larger than 0", "ValueError")
                } else {
                    return new MatrixDimensions(...splitValues)
                }
            } else {
                terminal.printError("Invalid Format! Valid format is RxC, e.g. \"3x2\"", "ParserError")
            }
        } else {
            if (/^[0-9]+$/.test(input)) {
                if (parseInt(input) == 0) {
                    terminal.printError("Dimensions must be larger than 0", "ValueError")
                } else {
                    return new MatrixDimensions(forcedRows, parseInt(input))
                }
            } else {
                terminal.printError("Invalid Format: Please enter a valid number of columns!", "ParserError")
            }
        }
    }
}

async function inputMatrix(dimensions) {
    let matrix = new Matrix(dimensions)
    const minInputWidth = 3
    let inputWidth = minInputWidth
    const badColor = "rgba(255, 0, 0, 0.5)"
    const goodColor = "rgba(0, 255, 0, 0.5)"

    let inputs = []
    let elements = []
    let finishButton = null

    const updateInputWidth = () => {
        let maxInputWidth = Math.max(...inputs.map(inp => inp.value.length)) + 1
        inputWidth = Math.max(maxInputWidth, minInputWidth)

        for (let input of inputs) {
            input.style.width = `${inputWidth * terminal.charWidth}px`
            input.style.marginTop = "5px"
            input.style.marginBottom = "5px"
        }

        const finishButtonWidth = Math.max(
            (dimensions.columns * (inputWidth + 1) + 1) * terminal.charWidth, 9 * terminal.charWidth)

        finishButton.style.width = `${finishButtonWidth}px`
    }

    for (let ri = 0; ri < dimensions.rows; ri++) {
        for (let ci = 0; ci < dimensions.columns; ci++) {
            elements.push(terminal.print(ci == 0 ? "[" : " ", undefined, {forceElement: true}))
            let input = terminal.createStyledInput()

            const setBad = () => {
                input.style.backgroundColor = badColor
                input.dataset.valid = false
            }

            const setGood = () => {
                input.style.backgroundColor = goodColor
                input.dataset.valid = true
            }

            input.addEventListener("keydown", event => {
                if (event.ctrlKey && event.key == "c") {
                    terminal.interrupt()
                }
            })

            input.style.textAlign = "center"
            setBad()
            input.style.width = `${terminal.charWidth * inputWidth}px`
            terminal.parentNode.appendChild(input)

            input.oninput = () => {
                updateInputWidth()
                if (input.value.match(/^\-?[0-9]+\/[0-9]+$/)) {
                    const parts = input.value.split("/")
                    let numericValue = parseInt(parts[0]) / parseInt(parts[1])
                    matrix.setCell(ri, ci, new MatrixCell(numericValue))
                    setGood()
                } else if (input.value.toString().match(/^\-?[0-9]+(?:\.[0-9]+)?$/)) {
                    let numericValue = parseFloat(input.value)
                    matrix.setCell(ri, ci, new MatrixCell(numericValue))
                    setGood()
                } else if (input.value.toString().match(/^[a-z]$/)) {
                    matrix.setCell(ri, ci, new MatrixCell(input.value.toString()))
                    setGood()
                } else {
                    setBad()
                }
            }

            inputs.push(input)
        }
        elements.push(terminal.printLine("]", undefined, {forceElement: true}))
    }

    inputs[0].focus()

    let finished = false

    finishButton = terminal.createTerminalButton({
        text: "Submit",
        charWidth: dimensions.columns * (inputWidth + 1) + 1,
        onPress: () => {
            if (inputs.find(inp => inp.dataset.valid == "false")) {
                return
            }

            for (let input of inputs) {
                input.style.backgroundColor = "transparent"
                input.oninput = () => {}
            }

            for (let element of elements) {
                element.remove()
            }

            terminal.printLine(matrix.toString())

            finished = true
        }
    })

    terminal.parentNode.appendChild(finishButton)
    updateInputWidth()

    elements.push(finishButton)
    elements.push(...inputs)

    while (!finished) {
        await terminal.sleep(500)
    }

    return matrix
}

terminal.modules.matrix = {
    Matrix, MatrixCellType,
    MatrixCell, MatrixDimensions,
    inputMatrixDimensions,
    inputMatrix
}