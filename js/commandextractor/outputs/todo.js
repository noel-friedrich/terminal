terminal.addCommand("todo", async function(rawArgs) {
    let parsedArgs = parseArgs(rawArgs, false)

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
                terminal.printf`${{[Color.COLOR_1]: item.check}} ${{[Color.WHITE]: stringPadBack(item.item, maxItemLength + 1)}} ${{[Color.WHITE]: item.id}}\n`
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
        terminal.printf`> '${{[Color.COLOR_2]: "$"}} todo ${{[Color.WHITE]: command}} ${{[Color.COLOR_1]: command_args[command].map(a => `<${a}>`).join(" ")}}'\n`
    }

    function showAvailableCommands() {
        terminal.printf`'${{[Color.COLOR_2]: "$"}} todo ${{[Color.COLOR_1]: "<command> [args...]"}}':\n`
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

let audioContext = null

