function classFromType(type) {
    switch (type) {
        case "directory":
            return Directory
        case "text":
            return TextFile
        case "executable":
            return ExecutableFile
        case "dataurl":
            return DataURLFile
        default:
            throw new Error("Unknown type: " + type);
    }
}

class File {

    constructor(type, content) {
        this.type = type || "file"
        this.content = content
        this.parent = null
        this.name = null
    }

    copy() {
        return File.fromObject(this.toJSON())
    }

    get path() {
        let tempPath = this.name ?? "root"
        let tempParent = this.parent
        while (tempParent) {
            let parentName = tempParent.name ?? "root"
            tempPath = parentName + "/" + tempPath
            tempParent = tempParent.parent
        }
        return tempPath
    }

    get pathArray() {
        let path = this.path.split("/")
        path.shift()
        return path
    }

    get relativeChildPaths() {
        let paths = []
        
        function getPaths(file, currPath) {
            paths.push(currPath)
            if (file.isDirectory) {
                for (let [key, value] of Object.entries(file.content)) {
                    getPaths(value, currPath + "/" + key)
                }
            }
        }

        getPaths(this, "")

        return paths.filter(path => path !== "").map(path => path.slice(1))
    }

    get isDirectory() {
        return false
    }

    toJSON() {
        return {
            type: this.type,
            content: this.content
        }
    }

    static fromObject(obj) {
        let children = []
        let content = obj.content
        if (obj.type === "directory") {
            for (let [key, value] of Object.entries(obj.content)) {
                content[key] = File.fromObject(value)
                children.push(content[key])
                content[key].name = key
            }
        }
        let file = new (classFromType(obj.type))(content)
        for (let child of children) {
            child.parent = file
        }
        return file
    }

}

class TextFile extends File {

    constructor(content) {
        super("text", content)
    }

}

class ExecutableFile extends File {

    constructor(content) {
        super("executable", content)
    }

}

class DataURLFile extends File {

    constructor(content) {
        super("dataurl", content)
    }

}

class MelodyFile extends File {

    constructor(content) {
        super("melody", content)
    }

}

class Directory extends File {

    constructor(content) {
        super("directory", content)
    }

    toJSON() {
        return {
            type: this.type,
            content: Object.fromEntries(Object.entries(this.content).map(([key, value]) => [key, value.toJSON()]))
        }
    }

    get isDirectory() {
        return true
    }

}

class FileSystem {

    constructor() {
        this.root = new Directory("root", {})
        this.currPath = []
        this.tempSave = undefined
    }

    get currFolder() {
        return this.getFile(this.pathStr)
    }

    _pathToString(path) {
        return "root/" + path.join("/")
    }

    get pathStr() {
        return this._pathToString(this.currPath)
    }

    _parsePath(path) {
        let parts = path.split(/[\\\/]/g).filter(part => part !== "")
        if (parts[0] === "root") {
            parts.shift()
        } else {
            parts = this.currPath.concat(parts)
        }
        return parts
    }

    getFile(path) {
        let parsedPath = this._parsePath(path)
        let temp = this.root
        for (let part of parsedPath) {
            if (temp.isDirectory && part in temp.content) {
                temp = temp.content[part]
            } else {
                return null
            }
        }
        return temp
    }

    toJSON() {
        return JSON.stringify(this.root.toJSON())
    }

    loadJSON(jsonString) {
        let parsed = JSON.parse(jsonString)
        this.root = File.fromObject(parsed)
    }

    reset() {
        localStorage.removeItem("terminal-filesystem")
        this.root = new Directory("root", {})
        this.currPath = []
    }

    save() {
        localStorage.setItem("terminal-filesystem", this.toJSON())
    }

    async load(jsonVal=undefined) {
        let json = jsonVal ?? localStorage.getItem("terminal-filesystem")
        if (json) {
            this.loadJSON(json)
        } else {
            await terminal._loadScript(terminal.defaultFileystemURL)
            this.save()
            this.loadJSON(this.toJSON())
        }
    }

    async reload() {
        this.save()
        await this.load()
    }

    allFiles(startPoint=this.root) {
        let files = []
        let stack = [startPoint]
        while (stack.length > 0) {
            let file = stack.pop()
            files.push(file)
            if (file.isDirectory) {
                stack.push(...Object.values(file.content))
            }
        }
        return files
    }

    saveTemp() {
        this.tempSave = this.toJSON()
    }

    async restoreTemp() {
        if (!this.tempSave) {
            throw new Error("no save to restore found")
        }
        await this.load(this.tempSave)
    }

}

class TerminalData {

    defaultValues = {
        "background": "#030306",
        "foreground": "#ffffff",
        "font": "\"Cascadia Code\", monospace",
        "accentColor1": "#ffff00",
        "accentColor2": "#8bc34a",
    }

    localStoragePrepend = "terminal-"

    getDefault(key) {
        return this.defaultValues[key]
    }

    get(key, defaultValue) {
        if (!defaultValue) defaultValue = this.getDefault(key)
        return localStorage.getItem(this.localStoragePrepend + key) ?? defaultValue
    }

    set(key, value) {
        localStorage.setItem(this.localStoragePrepend + key, value)
    }

    getCSSProperty(key) {
        let value = document.documentElement.style.getPropertyValue(key)
        if (!value) value = this.get(key)
        return value
    }

    setCSSProperty(key, value) {
        document.documentElement.style.setProperty(key, value)
    }

    get background() {
        return Color.fromHex(this.get("background"))
    }

    set background(color) {
        this.set("background", color.string.hex)
        this.setCSSProperty("--background", color.string.hex)
    }

    get foreground() {
        return Color.fromHex(this.get("foreground"))
    }

    set foreground(color) {
        this.set("foreground", color.string.hex)
        this.setCSSProperty("--foreground", color.string.hex)
    }

    get font() {
        return this.get("font")
    }

    set font(font) {
        this.set("font", font)
        this.setCSSProperty("--font", font)
    }

    get accentColor1() {
        return Color.fromHex(this.get("accentColor1"))
    }

    set accentColor1(color) {
        this.set("accentColor1", color.string.hex)
        this.setCSSProperty("--accent-color-1", color.string.hex)
    }

    get accentColor2() {
        return Color.fromHex(this.get("accentColor2"))
    }

    set accentColor2(color) {
        this.set("accentColor2", color.string.hex)
        this.setCSSProperty("--accent-color-2", color.string.hex)
    }

    get history() {
        return JSON.parse(this.get("history", "[]"))
    }

    set history(history) {
        this.set("history", JSON.stringify(history))
    }

    get lastItemOfHistory() {
        return this.history[this.history.length - 1]
    }

    addToHistory(command) {
        let history = this.history
        history.push(command)
        this.history = history
    }

    constructor() {
        this.background = this.background
        this.foreground = this.foreground
        this.font = this.font
        this.accentColor1 = this.accentColor1
        this.accentColor2 = this.accentColor2
    }

    resetProperty(key) {
        this.set(key, this.getDefault(key))
        this[key] = this[key]
    }

    resetAll() {
        for (let key in this.defaultValues) {
            this.set(key, this.defaultValues[key])
        }
        this.background = this.background
        this.foreground = this.foreground
        this.font = this.font
        this.accentColor1 = this.accentColor1
        this.accentColor2 = this.accentColor2
    }

}