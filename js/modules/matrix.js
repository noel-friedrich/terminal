const MatrixCellType = {
    Numeric: 0,
    Variable: 1
}

class MatrixCell {

    constructor(value) {
        this.type = (typeof value === "number") ? MatrixCellType.Numeric : MatrixCellType.Variable
        this.value = value
    }

    static get Default() {
        return new MatrixCell(0)
    }

    toString() {
        return this.value.toString()
    }

    _arithmeticFunc(other, f, templateString) {
        if (this.type == MatrixCellType.Numeric && other.type == MatrixCellType.Numeric) {
            return new MatrixCell(f(this.value, other.value))
        } else {
            let str = `(${templateString})`
                .replace("x", this.value)
                .replace("y", other.value)
            return new MatrixCell(str)
        } 
    }

    mul(other) {
        return this._arithmeticFunc(other, (x, y) => x * y, "x*y")
    }

    add(other) {
        return this._arithmeticFunc(other, (x, y) => x + y, "x+y")
    }

    sub(other) {
        return this._arithmeticFunc(other, (x, y) => x - y, "x-y")
    }

    div(other) {
        return this._arithmeticFunc(other, (x, y) => x / y, "x/y")
    }

}

class MatrixDimensions {

    constructor(rows, columns) {
        this.rows = rows
        this.columns = columns
    }

    static get Undefined() {
        return new MatrixDimensions(undefined, undefined)
    }

    toString() {
        return `${this.rows}x${this.columns}`
    }

}

class Matrix {

    constructor(dimensions, arrayData=undefined) {
        this.dimensions = dimensions
        this._data = Array.from({length: dimensions.rows},
            () => Array.from({length: dimensions.columns}, () => MatrixCell.Default))
    }

    static fromArray(arrayData) {
        let matrix = new Matrix(new MatrixDimensions(
            arrayData.length, arrayData[0].length
        ))

        for (let i = 0; i < arrayData.length; i++) {
            for (let j = 0; j < arrayData[i].length; j++) {
                matrix.setValue(i, j, new MatrixCell(arrayData[i][j]))
            }
        }

        return matrix
    }

    setValue(rowIndex, columnIndex, cell) {
        if (!(cell instanceof MatrixCell)) {
            throw new Error("cell must be instance of MatrixCell")
        }

        this._data[rowIndex][columnIndex] = cell
    }

    getCell(rowIndex, columnIndex) {
        return this._data[rowIndex][columnIndex]
    }

    get rows() {
        return this._data
    }

    get columns() {
        return Array.from({length: this.dimensions.columns}, (_, ci) => this.getColumn(ci))
    }

    toStringArray() {
        return this._data.map(
            row => row.map(
                element => element.toString()
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

        let outString = ""
        for (let ri = 0; ri < this.dimensions.rows; ri++) {
            outString += "[ "
            for (let ci = 0; ci < this.dimensions.columns; ci++) {
                outString += stringArray[ri][ci].padEnd(columnWidths[ci], " ")
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

                console.log(row, column)
                let dotProduct = row.map((n, i) => n.mul(column[i]))
                    .reduce((p, c) => p.add(c))
                result.setValue(ri, ci, dotProduct)
            }
        }
        return result
    }

}

async function inputMatrixDimensions({
    matrixName="A",
    forcedRows=undefined
}={}) {
    let message = `Matrix ${matrixName} Dimensions [e.g. 3x2]: `
    if (forcedRows) {
        message += `${forcedRows}x`
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
    let finishButton = null

    const updateInputWidth = () => {
        let maxInputWidth = Math.max(...inputs.map(inp => inp.value.length)) + 1
        inputWidth = Math.max(maxInputWidth, minInputWidth)

        for (let input of inputs) {
            input.style.width = `${inputWidth * terminal.charWidth}px`
        } 
        finishButton.style.width = `${(dimensions.columns * (inputWidth + 1) + 1) * terminal.charWidth}px`
    }

    for (let ri = 0; ri < dimensions.rows; ri++) {
        for (let ci = 0; ci < dimensions.columns; ci++) {
            terminal.print(ci == 0 ? "[" : " ")
            let input = terminal.createStyledInput()

            const setBad = () => {
                input.style.backgroundColor = badColor
                input.dataset.valid = false
            }

            const setGood = () => {
                input.style.backgroundColor = goodColor
                input.dataset.valid = true
            }

            input.style.textAlign = "center"
            setBad()
            input.style.width = `${terminal.charWidth * inputWidth}px`
            terminal.parentNode.appendChild(input)

            input.oninput = () => {
                updateInputWidth()
                if (input.value.toString().match(/^\-?[0-9]+(?:\.[0-9]+)?$/)) {
                    let numericValue = parseFloat(input.value)
                    matrix.setValue(ri, ci, new MatrixCell(numericValue))
                    setGood()
                } else if (input.value.toString().match(/^[a-z]$/)) {
                    matrix.setValue(ri, ci, new MatrixCell(input.value.toString()))
                    setGood()
                } else {
                    setBad()
                }
            }

            inputs.push(input)
        }
        terminal.printLine("]")
    }

    inputs[0].focus()

    return new Promise(resolve => {
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

                finishButton.remove()

                resolve(matrix)
            }
        })
    
        terminal.parentNode.appendChild(finishButton)
    })
}

terminal.modules.matrix = {
    Matrix, MatrixCellType,
    MatrixCell, MatrixDimensions,
    inputMatrixDimensions,
    inputMatrix
}