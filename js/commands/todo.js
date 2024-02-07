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

    static async editItem(uid, text_content) {
        return await fetchWithParam(TodoApi.EDIT_ITEM_API, {
            uid: uid,
            text_content: text_content
        })
    }

    static async deleteItem(uid) {
        return await fetchWithParam(TodoApi.DELETE_ITEM_API, {uid: uid})
    }

    static async checkItem(item_uid, checked) {
        return await fetchWithParam(TodoApi.CHECK_ITEM_API, {
            item_uid: item_uid,
            check_val: checked ? 1 : 0
        })
    }

}

terminal.addCommand("todo", async function(args) {
    const getTodoItemChoice = async (headerText) => {
        return new Promise(async (resolve, reject) => {
            const elements = []
    
            const loadingElement = terminal.printLine("\nLoading...", undefined, {forceElement: true})
    
            try {
                let todos = await TodoApi.getList(args.name)

                if (args.u) {
                    todos = todos.filter(t => t.done == "0")
                }

                loadingElement.remove()
    
                if (todos.length == 0) {
                    throw new Error("Specified todo list is empty")
                }
    
                elements.push(terminal.printLine(headerText, Color.COLOR_1, {forceElement: true}))
                
                for (let todo of todos) {
                    let text = todo.done == "1" ? "[x]" : "[ ]"
                    text += " " + todo.text_content + (todo.due_time != "-" ? ` (${todo.due_time})` : "") + "\n"
                    elements.push(terminal.printClickable(text, () => {
                        for (let element of elements) {
                            element.remove()
                        }
                        resolve(todo)
                    }))
                }
            } catch (e) {
                loadingElement.remove()
                reject(e)
            }

            terminal.scroll()
        })
    }

    if (args["rm-completed"]) {
        await terminal.acceptPrompt(`Do you really want to delete all completed todos from "${args.name}"?`, false)
        const progressModule = await terminal.modules.load("progressbar", terminal)
        
        const todos = await TodoApi.getList(args.name)
        const completedTodos = todos.filter(t => t.done == "1")

        if (completedTodos.length == 0) {
            throw new Error(`Todo List "${args.name}" doesn't contain any completed todos`)
        }

        const progressBar = progressModule.printProgressBar({width: 62})

        for (let i = 0; i < completedTodos.length; i++) {
            await TodoApi.deleteItem(completedTodos[i].uid)
            progressBar.update(i / completedTodos.length)
        }

        progressBar.finish()
        terminal.printSuccess(`Successfully removed ${completedTodos.length} todos.`)
        return

    } else if (args["rm-item"]) {
        const choice = await getTodoItemChoice("Please choose an item to delete.")
        await TodoApi.deleteItem(choice.uid)

        terminal.printSuccess(`Successfully deleted item ("${choice.text_content}")`)
        return

    } else if (args["edit-item"]) {
        const choice = await getTodoItemChoice("Please choose an item to edit.")
        const newText = await terminal.prompt("Enter the new text: ")
        await TodoApi.editItem(choice.uid, newText)

        terminal.printSuccess(`Successfully edited item ("${choice.text_content}")`)
        return

    } else if (args["add-item"]) {
        const newText = await terminal.prompt("Enter the text: ")
        let dueDate = "-"
        try {
            await terminal.acceptPrompt("Do you want to add a due date?", false)
            dueDate = await terminal.prompt("Due Date: ")
        } catch {}
        await TodoApi.addItem(args.name, newText, dueDate)

        terminal.printSuccess(`Successfully added item to "${args.name}"`)
        return

    }

    const outputElement = terminal.print("", undefined, {forceElement: true})

    let updateCount = 0

    const updateOutput = async () => {
        const currUpdate = ++ updateCount
        terminal.printLine("\nLoading...", undefined, {outputNode: outputElement})

        try {
            let todos = await TodoApi.getList(args.name)

            if (args.u) {
                todos = todos.filter(t => t.done == "0")
            }

            outputElement.innerHTML = "<br>"
            
            for (let todo of todos) {
                terminal.printClickable(todo.done == "1" ? "[x]" : "[ ]", async () => {
                    if (currUpdate != updateCount) return
                    await TodoApi.checkItem(todo.uid, todo.done != "1")
                    updateOutput()
                }, Color.COLOR_1, {outputNode: outputElement})

                const text = " " + todo.text_content + (todo.due_time != "-" ? ` (${todo.due_time})` : "")
                terminal.printLine(text, undefined, {outputNode: outputElement})
            }

            if (todos.length == 0) {
                const text = `< no todo items found >`
                terminal.printLine(text, undefined, {outputNode: outputElement})
            }

            terminal.printLine("", undefined, {outputNode: outputElement})
            terminal.printClickable("[Reload] ", () => {
                updateOutput()
            }, undefined, {outputNode: outputElement})
            terminal.printCommand("[Add Item] ", `todo ${args.name} --add-item`,
                undefined, false, {outputNode: outputElement})
            terminal.printCommand("[Remove Item] ", `todo ${args.name} --rm-item`,
                undefined, false, {outputNode: outputElement})
            terminal.printCommand("[Edit Item] ", `todo ${args.name} --edit-item`,
                undefined, false, {outputNode: outputElement})
            terminal.printLine("", undefined, {outputNode: outputElement})
        } catch (e) {
            console.error(e)
            outputElement.innerHTML = "<br>"
            terminal.printError(e.message, "Unexpected Error", {outputNode: outputElement})
        }

        outputElement
    }

    updateOutput()
}, {
    description: "show and manage a todo list",
    args: {
        "n=name:s": "name of the the todo list",
        "?u=uncompleted-only:b": "only show the uncompleted todos",
        "?a=add-item:b": "add an item to the todo list",
        "?r=rm-item:b": "remove an item from the todo list",
        "?e=edit-item:b": "edit an item of the todo list",
        "?rm-completed:b": "remove all completed todos from the todo list"
    }
})