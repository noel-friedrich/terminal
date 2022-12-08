class JsEnvironment {
    constructor() {
        this.iframe = document.createElement("iframe")
        this.iframe.style.display = "none"
        document.body.appendChild(this.iframe)
        this.document = this.iframe.contentDocument || this.iframe.contentWindow.document
    }

    eval(code) {
        try {
            let evaluation = this.iframe.contentWindow.eval(code)
            return [evaluation, null]
        } catch (e) {
            return [null, `${e.name}: ${e.message}`]
        }
    }

    getVars() {
        return this.iframe.contentWindow
    }

    getValue(name) {
        return this.getVars()[name]
    }

    setValue(name, value) {
        this.getVars()[name] = value
    }
}

terminal.modules.mathenv = new JsEnvironment()
terminal.modules.mathenv.setValue("sin", Math.sin)
terminal.modules.mathenv.setValue("cos", Math.cos)
terminal.modules.mathenv.setValue("tan", Math.tan)
terminal.modules.mathenv.setValue("asin", Math.asin)
terminal.modules.mathenv.setValue("acos", Math.acos)
terminal.modules.mathenv.setValue("atan", Math.atan)
terminal.modules.mathenv.setValue("atan2", Math.atan2)
terminal.modules.mathenv.setValue("sinh", Math.sinh)
terminal.modules.mathenv.setValue("cosh", Math.cosh)
terminal.modules.mathenv.setValue("tanh", Math.tanh)
terminal.modules.mathenv.setValue("asinh", Math.asinh)
terminal.modules.mathenv.setValue("acosh", Math.acosh)
terminal.modules.mathenv.setValue("atanh", Math.atanh)
terminal.modules.mathenv.setValue("exp", Math.exp)
terminal.modules.mathenv.setValue("log", Math.log)
terminal.modules.mathenv.setValue("log10", Math.log10)
terminal.modules.mathenv.setValue("sqrt", Math.sqrt)
terminal.modules.mathenv.setValue("abs", Math.abs)
terminal.modules.mathenv.setValue("ceil", Math.ceil)
terminal.modules.mathenv.setValue("floor", Math.floor)
terminal.modules.mathenv.setValue("round", Math.round)
terminal.modules.mathenv.setValue("PI", Math.PI)
terminal.modules.mathenv.setValue("e", Math.E)
terminal.modules.mathenv.setValue("E", Math.E)

terminal.modules.mathenv.setValue("sum", (startX, endX, func) => {
    let sum = 0
    for (let x = startX; x <= endX; x++) {
        sum += func(x)
    }
    return sum
})

terminal.modules.mathenv.setValue("terminal", terminal)