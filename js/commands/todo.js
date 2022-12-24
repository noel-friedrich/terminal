function fetchWithParam(url, params) {
    let query = Object.keys(params).map(key => `${key}=${encodeURIComponent(params[key])}`).join("&")
    return fetch(`${url}?${query}`)
}

class TodoApi {

    static GET_LIST_API = "https://www.noel-friedrich.de/todo/api/get-list.php"
    static ADD_ITEM_API = "https://www.noel-friedrich.de/todo/api/add-item.php"
    static EDIT_ITEM_API = "https://www.noel-friedrich.de/todo/api/edit-item.php"
    static DELETE_ITEM_API = "https://www.noel-friedrich.de/todo/api/delete-item.php"
    static CHECK_ITEM_API = "https://www.noel-friedrich.de/todo/api/check-item.php"

    static async getList(owner_name) {
        let response = await fetchWithParam(TodoApi.GET_LIST_API, {
            owner_name: owner_name
        })
        return await response.json()
    }
    
    static async addItem(owner_name, text_content, due_time="-") {
        return await fetchWithParam(TodoApi.ADD_ITEM_API, {
            owner_name: owner_name,
            text_content: text_content,
            due_time: due_time
        })
    }

    static async editItem(id, text_content) {
        return await fetchWithParam(TodoApi.EDIT_ITEM_API, {
            id: id,
            text_content: text_content
        })
    }

    static async deleteItem(id) {
        return await fetchWithParam(TodoApi.DELETE_ITEM_API, {id: id})
    }

    static async checkItem(item_id, checked) {
        return await fetchWithParam(TodoApi.CHECK_ITEM_API, {
            item_id: item_id,
            check_val: checked ? 1 : 0
        })
    }

}

terminal.addCommand("todo", async function(rawArgs) {
    let parsedArgs = TerminalParser.tokenize(rawArgs)

    const commands = {
        "list": async function(name) {
            let data = await TodoApi.getList(name)
            let formattedData = []
            for (let rawItem of data) {
                let check = (rawItem.done == 1) ? "[x]" : "[ ]"
                let due = rawItem.due_time == "-" ? "" : ` (${rawItem.due_time})`
                let item = `${rawItem.text_content}${due}`
                let id = `#${rawItem.id}`
                formattedData.push({
                    check: check, item: item, id: id
                })
            }
            if (formattedData.length == 0) {
                terminal.printLine(`No items found`)
            }
            let maxItemLength = formattedData.reduce((max, item) => Math.max(max, item.item.length), 0)
            for (let item of formattedData) {
                terminal.print(item.check, Color.COLOR_1)
                terminal.print(stringPadBack(item.item, maxItemLength + 1), Color.WHITE)
                terminal.printLine(item.id, Color.WHITE)
            }
        },
        "check": async function(id) {
            await TodoApi.checkItem(id, true)
        },
        "uncheck": async function(id) {
            await TodoApi.checkItem(id, false)
        },
        "add": async function(name, text, due_date="-") {
            await TodoApi.addItem(name, text, due_date)
        },
        "edit": async function(id, text) {
            await TodoApi.editItem(id, text)
        },
        "delete": async function(id) {
            await TodoApi.deleteItem(id)
        }
    }

    const command_args = {
        "list": ["name"],
        "check": ["id"],
        "uncheck": ["id"],
        "add": ["name", "text", "due_date"],
        "edit": ["id", "text"],
        "delete": ["id"]
    }

    function showAvailableCommand(command) {
        terminal.print(`> '`, Color.COLOR_2)
        terminal.print(`$ todo ${command} ${command_args[command].map(a => `<${a}>`).join(" ")}`, Color.WHITE)
        terminal.printLine(`'`, Color.COLOR_2)
    }

    function showAvailableCommands() {
        terminal.print(`'`, Color.COLOR_2)
        terminal.print(`$ todo `, Color.WHITE)
        terminal.print(`<command> [args...]`, Color.COLOR_1)
        terminal.printLine(`'`, Color.COLOR_2)
        for (let [command, _] of Object.entries(command_args)) {
            showAvailableCommand(command)
        }
    }

    if (parsedArgs.length == 0 || (parsedArgs.length == 1 && parsedArgs[0] == "help")) {
        terminal.printLine(`You must supply at least 1 argument:`)
        showAvailableCommands()
        return
    }

    let command = parsedArgs[0]
    let args = parsedArgs.slice(1)

    if (!(command in commands)) {
        terminal.printLine(`Unknown command! Available commands:`)
        showAvailableCommands()
        return
    }

    if (args.length != command_args[command].length) {
        terminal.printLine(`Invalid number of arguments!`)
        showAvailableCommand(command)
        return
    }

    await commands[command](...args)
}, {
    description: "manage a todo list",
    rawArgMode: true
})