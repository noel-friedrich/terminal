class TermlSettings {

    static INLINE_DELIMITER = " "
    static LINE_DELIMIETER = "\n"
    static INDENT_CHAR = "\t" // must be a single character
    static DEF_KEYWORD = "DEF"
	static COMMENT_CHAR = "#" // must be a single character

	static TAB_WIDTH = 4

	static maxRepeat = 1000

	static OUT_FUNC = (str) => {
		Terml.output += str
	}

	static IN_FUNC = (str) => {
		return prompt(str)
	}

}

class TermlError extends Error {

    static makeName(name) {
        return `Terml${name}Error`
    }

    constructor(message) {
        super(message)
        this.name = TermlError.makeName("")
    }

}

class TermlSyntaxError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlError.makeName("Syntax")
	}

}

class TermlRuntimeError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlError.makeName("Runtime")
	}

    static makeName(name) {
		return `TermlRuntime${name}Error`
	}

}

class TermlRuntimeNumArgumentsError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("NumArguments")
	}

}

class TermlRuntimeTypeError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("Type")
	}

}

class TermlRuntimeMaxRepeatError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("MaxRepeat")
	}

}

class TermlRuntimeSubstatementIndexError extends TermlError {

	constructor(message) {
		super(message)
		this.name = TermlRuntimeError.makeName("SubstatementIndex")
	}

}

class TermlValueObject {}

class TermlLiteral extends TermlValueObject {

	constructor(value) {
		super()
		this._value = value
		this.isLiteral = true
	}

	get value() {
		return this._value	
	}

	static fromToken(token) {
		if (token.isStringLiteral)
			return new TermlStringLiteral(token.value)
		if (token.isNumberLiteral)
			return new TermlNumberLiteral(token.value)
		throw new TermlError("Token is not a literal")
	}

}

class TermlStringLiteral extends TermlLiteral {

	constructor(value) {
		super(value.toString())
	}

	static fromArray(arr) {
		let str = ""
		for (let charCode of arr) {
			let char = String.fromCharCode(charCode)
			str += char
		}
		return new TermlStringLiteral(str)
	}

	get stringValue() {
		return this._value
	}

	toString() {
		return `"${this.value}"`
	}

	get value() {
		let listData = []
		for (let char of this._value) {
			let charCode = char.charCodeAt(0)
			listData.push(charCode)
		}
		return listData
	}

}

class TermlNumberLiteral extends TermlLiteral {

	constructor(value) {
		super(value)
	}

	toString() {
		return `${this.value}`
	}

}

class TermlToken {

	checkIfNumberLiteral() {
		const numRegex = /^-?\d+(?:\.\d+)?$/

		if (numRegex.test(this.content)) {
			this.isNumberLiteral = true
			this.content = parseFloat(this.content)
			let error = TermlVariable.getValueError(this.content)
			if (error) throw error
			return true
		}

		return false
	}

	toString() {
		return this.content
	}

    constructor(content, {isStringLiteral=false}={}) {
        this.content = content
		this.isStringLiteral = isStringLiteral
		this.isNumberLiteral = this.checkIfNumberLiteral()
    }

	get isLiteral() {
		return this.isStringLiteral || this.isNumberLiteral
	}

	toLiteral() {
		return TermlLiteral.fromToken(this)
	}

    get value() {
        return this.content
    }

}

function TermlIsVar(obj) {
	return (
		obj instanceof TermlVariable ||
		obj instanceof TermlList
	)
}

class TermlVariable extends TermlValueObject {

    constructor(name, value, parentContainer) {
		super()
        if (!name) throw new TermlError("No name provided")
        this.name = name
        this.setValue(value)

        if (!(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Container is not a TermlVariableContainer")
        this.parentContainer = parentContainer
		this.isList = false
    }

	toString() {
		return `VAR{${this.name}}`
	}

	toCharacter() {
		let char = String.fromCharCode(this.value)
		return char
	}

    get isRoot() {
        return this.parentContainer === undefined   
    }

    get value() {
        return this._value
    }

    set value(value) {
        this.setValue(value)
    }

    static getValueError(value) {
        if (typeof value !== "number")
            return new TermlError("Value is not a number")
    }

    setValue(value=0) {
        const error = TermlVariable.getValueError(value)
        if (error) throw error
        this._value = value
    }

    get binString() {
        return this.value.toString(2).padStart(8, "0")
    }

    get hexString() {
        return this.value.toString(16).padStart(2, "0").toUpperCase()
    }

}

class TermlList extends TermlValueObject {

	constructor(name, value, parentContainer) {
		super()
        if (!name) throw new TermlError("No name provided")
        this.name = name
        this.setValue(value)

        if (!(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Container is not a TermlVariableContainer")
        this.parentContainer = parentContainer
		this.isList = true
	}

	toString() {
		return `LIST{${this.name}}`
	}

	set value(value) {
		this.setValue(value)
	}

	copyValue() {
		return this._value.slice()
	}

	get reference() {
		return this._value
	}

	get value() {
		return this.copyValue()
	}

	setValue(value=[]) {
        const error = TermlList.getValueError(value)
        if (error) throw error
        this._value = value
	}

	static getValueError(value) {
		if (!Array.isArray(value))
			return new TermlError("Value is not an array")
		for (let i = 0; i < value.length; i++) {
			const error = TermlVariable.getValueError(value[i])
			if (error) return error
		}
	}

	getStringContent() {
		return this.value.map(v => v.toCharacter()).join()
	}

	get binString() {
		return this.value.map(v => v.toString(2).padStart(8, "0")).join(" ")
	}

	get hexString() {
		return this.value.map(v => v.toString(16).padStart(2, "0").toUpperCase()).join(" ")
	}

}

class TermlModule {

	constructor(name, functions, variables, termlCode) {
		const toDict = (arr, key) => {
			let dict = {}
			for (let item of arr) {
				dict[item[key]] = item
			}
			return dict
		}

		if (!name) throw new TermlError("No name provided")
		this.name = name
		this.functions = toDict(functions, "name")
		this.variables = toDict(variables, "name")
		this.termlCode = termlCode
	}

}

class TermlVariableContainer {

    constructor({name=undefined, parentContainer=undefined}={}) {
        this.variables = {}
        this.functions = {}
        this.name = name // name may be undefined

        if (parentContainer && !(parentContainer instanceof TermlVariableContainer))
            throw new TermlError("Parent container is not a VariableContainer")
        this.parentContainer = parentContainer // parentContainer may be undefined
    }

	importModule(module) {
		if (!(module instanceof TermlModule))
			throw new TermlError("Module is not a TermlModule")
		for (let name in module.functions) {
			if (!this.functionExists(name))
				this.setFunction(name, module.functions[name])
		}
		for (let name in module.variables) {
			if (!this.variableExists(name))
				this.setVariable(name, module.variables[name])
		}
	}

    setFunction(name, func) {
        if (!name)
            throw new TermlError("No name provided")
        if (!(func instanceof TermlFunction))
            throw new TermlError("Function is not a TermlFunction")
        this.functions[name] = func
    }

    functionExists(name) {
        if (!name)
            throw new TermlError("No name provided")
        return this.functions[name] !== undefined
    }

    getFunction(name) {
        if (!name) 
            throw new TermlError("No name provided")
        return this.functions[name]
    }

    getVariable(name) {
        if (!name)
            throw new TermlError("No name provided")
        return this.variables[name]
    }

	variableExists(name) {
		if (!name)
			throw new TermlError("No name provided")
		return this.variables[name] !== undefined
	}

	setVariableRef(name, variable) {
		if (!name)
			throw new TermlError("No name provided")
		if (!TermlIsVar(variable))
			throw new TermlError("Variable is not a TermlVariable")
		this.variables[name] = variable
	}

    setVariable(name, value) {
        if (!name)
            throw new TermlError("No name provided")
        if (this.variables[name]) {
            this.variables[name].value = value
        } else {
			try {
				this.variables[name] = new TermlVariable(name, value, this)
			} catch (error) {
				try {
					this.variables[name] = new TermlList(name, value, this)
				} catch (error) {
					throw new TermlError("Variable is not a TermlVariable or TermlList")
				}
			}
        }
    }

}

class TermlStatement {

    constructor(functionName, args, {substatements=undefined, parent=undefined, container=undefined}={}) {
        if (!functionName)
            throw new TermlError("No functionName provided")
        this.functionName = functionName
        this.args = args || []
        this.substatements = substatements || []
		this.container = container || new TermlVariableContainer({name: this.makeContainerName()})
        this.parent = parent // parent may be undefined

		this.isStatement = true
		this.isFunction = false
    }

	toString() {
		return `STMT{${this.functionName.value}; ${this.args.map(a => a.toString()).join(", ")}}`
	}

	makeContainerName() {
        return `STMT{${this.functionName.value}}`
    }

    addSubstatement(statement) {
        if (!(statement instanceof TermlStatement))
            throw new TermlError("Statement is not a TermlStatement")
        this.substatements.push(statement)
    }

    static fromTokens(tokens, opts) {
        if (!tokens || !tokens.length)
            throw new TermlError("No tokens provided")
        const functionName = tokens.shift()
        return new TermlStatement(functionName, tokens, opts)
    }

}

class TermlFunction {

    constructor(name, args, statements, jsFunction) {
        if (!name)
            throw new TermlError("No name provided")
        this.name = name
        this.args = args || []
        this.statements = statements || []
        this.container = new TermlVariableContainer({name: this.makeContainerName()})

		if (jsFunction && typeof jsFunction !== "function")
			throw new TermlError("jsFunction is not a function")
		this.jsFunction = jsFunction

		this.isStatement = false
		this.isFunction = true
    }

	execute() {
		if (this.jsFunction) {
			return this.jsFunction(...arguments)
		} else {
			throw new TermlError("Function has no jsFunction")
		}
	}

    makeContainerName() {
        return `FUNC{${this.name.value}}`
    }

    addStatement(statement) {
        if (!(statement instanceof TermlStatement))
            throw new TermlError("Statement is not a TermlStatement")
        this.statements.push(statement)
    }

}

class TermlParser {

    constructor() {
        this.globalStatement = new TermlStatement(
			new TermlToken("__GLOBAL__"),
            [], {parent: undefined})
    }

    tokenize(line) {
        let tokens = []
        let currentToken = ""
        let inString = false
		const inlineDeliminiters = [TermlSettings.INLINE_DELIMITER]
        const stringDelimiters = ["\"", "'"]
        let currentStringDelimiter = undefined

        for (let char of line) {
            if (inString) {
                if (char === currentStringDelimiter) {
                    inString = false
                    currentStringDelimiter = undefined
                    tokens.push(new TermlToken(currentToken, {isStringLiteral: true}))
                    currentToken = ""
                } else {
                    currentToken += char
                }
            } else {
                if (stringDelimiters.includes(char)) {
                    inString = true
                    currentStringDelimiter = char
                } else if (inlineDeliminiters.includes(char)) {
                    if (currentToken !== "")
                        tokens.push(new TermlToken(currentToken))
                    currentToken = ""
                } else {
                    currentToken += char
                }
            }
			if (currentToken === TermlSettings.INDENT_CHAR) {
				tokens.push(new TermlToken(currentToken))
				currentToken = ""
			}
        }

        if (currentToken !== "")
            tokens.push(new TermlToken(currentToken))

		tokens = tokens.map(token => {
			if (token.isLiteral)
				return token.toLiteral()
			else
				return token
		})

        return tokens
    }

    parseLines(lines) {
		let tokenizedLines = lines.map(this.tokenize)
        let currIndent = 0

        let lastStatement = undefined
		
		let currParent = this.globalStatement
        for (let line of tokenizedLines) {
			if (line.length === 0)
				continue

            let indent = 0
            while (line[0].value === TermlSettings.INDENT_CHAR) {
                indent++
                line.shift()
            }

            if (indent - 1 > currIndent)
                throw new TermlSyntaxError("Invalid indentation")

            while (indent < currIndent) {
                currParent = currParent.parent
                currIndent--
            }

            if (indent > currIndent) {
                if (!lastStatement)
                    throw new TermlSyntaxError("Invalid indentation (no previous statement)")

                currParent = lastStatement
            }

            let statement = TermlStatement.fromTokens(line, 
                {parent: currParent})

            currParent.addSubstatement(statement)

			lastStatement = statement
			currIndent = indent
        }
    }

    extractLines(string) {
        return string
            .split(TermlSettings.LINE_DELIMIETER)
            .filter(line => line.trim().length > 0)
    }

    parse(string) {
        if (typeof string !== "string")
            throw new TermlError("Input is not a string")
        this.parseLines(this.extractLines(string))
		return this.globalStatement
    }

}

const TermlStandardModule = new TermlModule("standard", [

	new TermlFunction("__GLOBAL__", [], [], (args, statement, runtime) => {
		Terml.checkType(args, [])
		for (let substatement of statement.substatements) {
			runtime.executeStatement(substatement)
		}
	}),

	new TermlFunction("NEW", ["name", "?value"], [], (args, statement, runtime) => {
		let container = statement.parent.container
		if (!Terml.getTypeError(args, [TermlStringLiteral])) {
			container.setVariable(args[0].stringValue, undefined)
			return
		} 

		Terml.checkType(args, [TermlStringLiteral, TermlValueObject])
		let [varName, varValue] = args
		container.setVariable(varName.stringValue, varValue.value)
	}),

	new TermlFunction("NEW_LST", ["name", "?value"], [], (args, statement, runtime) => {
		let container = statement.parent.container
		if (!Terml.getTypeError(args, [TermlStringLiteral])) {
			container.setVariable(args[0].stringValue, [])
			return
		} 

		window.container = container

		Terml.checkType(args, [TermlStringLiteral, TermlStringLiteral])
		let [varName, varValue] = args
		container.setVariable(varName.stringValue, varValue.value)
	}),

	new TermlFunction("PUSH", ["name", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, valueToken] = args
		variable.reference.push(valueToken.value)
	}),

	new TermlFunction("INSERT_AT", ["name", "value", "index"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlNumberLiteral])
		let [variable, valueToken, indexToken] = args
		variable.reference.splice(indexToken.value, 0, valueToken.value)
	}),

	new TermlFunction("POP", ["name", "?var"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList])) {
			let [variable] = args
			variable.reference.pop()
			return
		}
		Terml.checkType(args, [TermlList, TermlVariable])
		let [variable, valueToken] = args
		if (variable.value.length === 0)
			return
		valueToken.value = variable.reference.pop()
	}),

	new TermlFunction("CONCAT", ["list1", "list2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlList])
		let [list1, list2] = args
		list1.value = list1.value.concat(list2.value)
	}),

	new TermlFunction("UNSHIFT", ["name", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, valueToken] = args
		variable.reference.unshift(valueToken.value)
	}),

	new TermlFunction("DELETE_AT", ["name", "index"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject])
		let [variable, indexToken] = args
		if (indexToken.value >= variable.value.length)
			return
		variable.reference.splice(indexToken.value, 1)
	}),

	new TermlFunction("SHIFT", ["name", "?var"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList])) {
			let [variable] = args
			variable.reference.shift()
			return
		}
		Terml.checkType(args, [TermlList, TermlVariable])
		let [variable, valueToken] = args
		valueToken.value = variable.reference.shift()
	}),

	new TermlFunction("GET_AT", ["name", "index", "var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlVariable])
		let [variable, indexToken, valueToken] = args
		valueToken.value = variable.reference[indexToken.value]
	}),

	new TermlFunction("SET_AT", ["name", "index", "value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList, TermlValueObject, TermlValueObject])
		let [variable, indexToken, valueToken] = args
		variable.reference[indexToken.value] = valueToken.value
	}),

	new TermlFunction("SET", ["name", "value"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlList, TermlList])) {
			let [list1, list2] = args
			list1.value = list2.value
			return
		}
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [variable, valueToken] = args
		variable.value = valueToken.value
	}),

	new TermlFunction("OUT", ["value"], [], (args, statement, runtime) => {
		if (!Terml.getTypeError(args, [TermlValueObject])) {
			let [valueToken] = args
			let value = valueToken.value
			if (Array.isArray(value)) 
				value = TermlStringLiteral.fromArray(value).stringValue
			TermlSettings.OUT_FUNC(("" + value).replace(/\\n/g, "\n"))
		}
	}),

	new TermlFunction("OUT_LST", ["value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let error = Terml.getTypeError(args, [TermlList])
		if (error) error = Terml.getTypeError(args, [TermlStringLiteral])
		if (error) throw error
		let stringVal = JSON.stringify(args[0].value)
		TermlSettings.OUT_FUNC(stringVal)
	}),

	new TermlFunction("IN", ["name"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlList])
		let [variable] = args
		let input = TermlSettings.IN_FUNC()
		variable.value = new TermlStringLiteral(input).value
	}),

	new TermlFunction("ADD", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value += var2.value
	}),

	new TermlFunction("SUB", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value -= var2.value
	}),

	new TermlFunction("MUL", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value *= var2.value
	}),

	new TermlFunction("DIV", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value /= var2.value
	}),

	new TermlFunction("MOD", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value %= var2.value
	}),

	new TermlFunction("POW", ["var1", "var2"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable, TermlValueObject])
		let [var1, var2] = args
		var1.value = Math.pow(var1.value, var2.value)
	}),

	new TermlFunction("ROUND", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.round(var1.value)
	}),

	new TermlFunction("SQRT", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.sqrt(var1.value)
	}),

	new TermlFunction("FLOOR", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.floor(var1.value)
	}),

	new TermlFunction("CEIL", ["var"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlVariable])
		let [var1] = args
		var1.value = Math.ceil(var1.value)
	}),

	new TermlFunction("DEF", [], [], (args, defStatement, runtime) => {
		Terml.checkType(args[0], TermlStringLiteral)
		let funcName = args[0].stringValue
		let funcArgs = args.slice(1)
		Terml.checkType(funcArgs, funcArgs.map(() => TermlStringLiteral))

		function parseVarName(name) {
			let info = {
				isReference: false,
			}

			if (name.startsWith("&")) {
				info.isReference = true
				name = name.slice(1)
			}

			info.name = name
			return info
		}

		function jsFunc(args, statement) {
			if (args.length !== funcArgs.length)
				throw new TermlRuntimeNumArgumentsError()
			Terml.checkType(args, args.map(() => TermlValueObject))
			for (let i = 0; i < funcArgs.length; i++) {
				let varInfo = parseVarName(funcArgs[i].stringValue)
				if (varInfo.isReference && TermlIsVar(args[i])) {
					defStatement.container.setVariableRef(varInfo.name, args[i])
				} else {
					defStatement.container.setVariable(funcArgs[i].stringValue, args[i].value)
				}
			}

			defStatement.container.setFunction("EXEC_SUB", new TermlFunction("EXEC_SUB", [], [], (execArgs) => {
				Terml.checkType(execArgs, [TermlValueObject])
				let subIndex = execArgs[0].value
				if (subIndex < 0 || subIndex >= defStatement.substatements.length)
					throw new TermlRuntimeSubstatementIndexError()
				let substatement = statement.substatements[subIndex]
				if (substatement === undefined)
					throw new TermlRuntimeSubstatementIndexError("undefined")
				runtime.executeStatement(substatement)
			}))

			defStatement.container.setFunction("LEN_SUB", new TermlFunction("LEN_SUB", [], [], (lenArgs) => {
				Terml.checkType(lenArgs, [TermlVariable])
				lenArgs[0].value = statement.substatements.length
			}))

			for (let substatement of defStatement.substatements) {
				runtime.executeStatement(substatement)
			}
		}

		let func = new TermlFunction(funcName, args, defStatement.substatements, jsFunc)
		defStatement.parent.container.setFunction(funcName, func)
	}),

	new TermlFunction("IS_EQ", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value === val2.value) ? 1 : 0
	}),

	new TermlFunction("IS_LT", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value < val2.value) ? 1 : 0
	}),

	new TermlFunction("IS_GT", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value > val2.value) ? 1 : 0
	}),

	new TermlFunction("OR", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		outputVar.value = (val1.value || val2.value) ? 1 : 0
	}),

	new TermlFunction("XOR", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		let a = val1.value ? 1 : 0
		let b = val2.value ? 1 : 0
		outputVar.value = (a ^ b) ? 1 : 0
	}),

	new TermlFunction("NOT", ["val1", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlVariable])
		let [val1, outputVar] = args
		outputVar.value = (val1.value) ? 0 : 1
	}),

	new TermlFunction("AND", ["val1", "val2", "var"], [], (args) => {
		Terml.checkType(args, [TermlValueObject, TermlValueObject, TermlVariable])
		let [val1, val2, outputVar] = args
		let a = val1.value ? 1 : 0
		let b = val2.value ? 1 : 0
		outputVar.value = (a && b) ? 1 : 0
	}),

	new TermlFunction("IF", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		if (value.value !== 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

	new TermlFunction("IF_NOT", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		if (value.value === 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

	new TermlFunction("WHILE", ["value"], [], (args, statement, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		let count = 0
		while (value.value !== 0) {
			for (let substatement of statement.substatements) {
				runtime.executeStatement(substatement)
			}
			count++
			if (count > TermlSettings.maxRepeat)
				throw new TermlRuntimeMaxRepeatError("WHILE loop exceeded maximum number of iterations")
		}
	}),

	new TermlFunction("WHILE_NOT", ["value"], [], (args, statements, runtime) => {
		Terml.checkType(args, [TermlValueObject])
		let [value] = args
		let count = 0
		while (value.value !== 0) {
			for (let substatement of statements.substatements) {
				runtime.executeStatement(substatement)
			}
			count++
			if (count > TermlSettings.maxRepeat)
				throw new TermlRuntimeMaxRepeatError("WHILE_NOT loop exceeded maximum number of iterations")
		}
	}),

	new TermlFunction("REPEAT", ["value"], [], (args, statement, runtime) => {
		let variable = null
		if (!Terml.getTypeError(args, [TermlValueObject, TermlStringLiteral])) {
			let container = statement.container
			container.setVariable(args[1].stringValue, undefined)
			variable = container.getVariable(args[1].stringValue)
		} else {
			Terml.checkType(args, [TermlValueObject])
		}
		
		let val = args[0].value

		if (val < 0)
			throw new TermlRuntimeError("REPEAT value must be positive")
		if (val > TermlSettings.maxRepeat)
			throw new TermlRuntimeMaxRepeatError(`REPEAT value must be less than ${TermlSettings.maxRepeat}`)
		for (let count = 0; count < val; count++) {
			if (variable)
				variable.value = count
			for (let substatement of statement.substatements) {
				runtime.executeStatement(substatement)
			}
		}
	}),

], [])

class TermlRuntime {

	constructor(globalStatement) {
		this.preCode = ""
		this.globalStatement = globalStatement
		this.importModule(TermlStandardModule)
	}

	importModule(module) {
		this.globalStatement.container.importModule(module)
	}

	execute() {
		this.executeStatement(this.globalStatement)
	}

	getVariable(name, statement) {
		if (!statement)
			statement = this.globalStatement

		let currContainer = statement
		while (!currContainer.container.variableExists(name)) {
			currContainer = currContainer.parent
			if (!currContainer) {
				throw new TermlError(`Variable ${name} is not defined`)
			}
		}
		return currContainer.container.getVariable(name)
	}

	getFunction(name, statement) {
		if (!statement)
			statement = this.globalStatement

		let currContainer = statement
		while (!currContainer.container.functionExists(name)) {
			currContainer = currContainer.parent
			if (!currContainer)
				throw new TermlError(`Function ${name} is not defined`)
		}
		return currContainer.container.getFunction(name)
	}

	executeStatement(statement) {
		let functionName = statement.functionName.value
		let func = this.getFunction(functionName, statement)
		let args = statement.args.map(arg => {
			return (arg.isLiteral) ? arg : this.getVariable(arg.value, statement)
		})
		func.execute(args, statement, this)
	}

}

class Terml {

	static output = ""

	static checkType(value, type) {
		let error = Terml.getTypeError(value, type)
		if (error) throw error
	}

	static getTypeError(value, type) {
		if (type instanceof Array) {
			if (!(value instanceof Array)) {
				return new TermlRuntimeTypeError("Array")
			}
			if (type.length !== value.length) {
				return new TermlRuntimeNumArgumentsError()
			}
			if (type.length === 0)
				return undefined
			for (let t of type) {
				for (let v of value)
					if (v instanceof t)
						return undefined
					else
						return new TermlRuntimeTypeError(t.name)
			}
			throw new TermlRuntimeTypeError(type.name)
		} else {
			if (value instanceof type)
				return undefined
			else
				return new TermlRuntimeTypeError(type.name)
		}
	}

	static get Settings() {
		return TermlSettings
	}

	static removeStaticWhitespace(text) {
		let lines = text.split("\n").filter(l => l.length > 0)
		const allLinesStartWith = str => {
			for (let line of lines)
				if (!line.startsWith(str))
					return false
			return true
		}

		const removeFirstCharOfLines = () => {
			for (let i = 0; i < lines.length; i++) {
				lines[i] = lines[i].slice(1)
			}
			lines = lines.filter(l => l.length > 0)
			return lines.length === 0
		}

		while (allLinesStartWith(" ")) if(removeFirstCharOfLines()) break
		while (allLinesStartWith("\t")) if(removeFirstCharOfLines()) break

		return lines.join("\n")
	}

	static furbishCode(code) {
		const commentRegex = new RegExp(`^[\\s\\t]*${TermlSettings.COMMENT_CHAR}.*$`)
		let lines = code.split(TermlSettings.LINE_DELIMIETER)
			.filter(l => l.length > 0)
			.filter(l => !commentRegex.test(l))
		
		code = lines.join(TermlSettings.LINE_DELIMIETER)
		code = Terml.removeStaticWhitespace(code)
			.replaceAll(" ".repeat(TermlSettings.TAB_WIDTH), TermlSettings.INDENT_CHAR)

		let docParser = new DOMParser().parseFromString(code, "text/html")
		return docParser.documentElement.textContent
	}

	static run(code, {log=false}={}) {
		code = Terml.furbishCode(code)
		Terml.output = ""
		const parser = new TermlParser()
		const globalStatement = parser.parse(code)
		const runtime = new TermlRuntime(globalStatement)
		runtime.execute()

		if (log) Terml.logOutput()

		return Terml.output
	}

	static logOutput() {
		console.log(Terml.output)
	}

	static parseDocument(document) {
		let termlElements = document.querySelectorAll("terml")
		for (let element of termlElements) {
			const code = element.innerHTML
			const parentElement = element.parentElement
			element.remove()

			let newTextContent = ""

			try {
				newTextContent = Terml.run(code)
			} catch (e) {
				if (e instanceof TermlError) {
					newTextContent = e.toString()
				} else {
					throw e
				}
			}

			parentElement.innerHTML += newTextContent
		}
	}

}

terminal.addCommand("terml", async function(args) {
	const file = terminal.getFile(args.file)
	if (file.isDirectory)
		throw new Error("File is not readable")
	const code = file.content
	TermlSettings.OUT_FUNC = txt => {
		terminal.print(txt)
	}
	
	try {
		Terml.run(code)
	} catch (e) {
		terminal.addLineBreak()
		throw e
	}
}, {
	description: "run a .terml file",
	args: {
		"file": "the file to run"
	}
})