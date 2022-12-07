terminal.addCommand("download", function(args) {
    function downloadFile(fileName, file) {
        let element = document.createElement('a')
        if (file.type == FileType.DATA_URL)
            var dataURL = file.content
        else
            var dataURL = 'data:text/plain;charset=utf-8,' + encodeURIComponent(file.content)
        element.setAttribute('href', dataURL)
        element.setAttribute('download', fileName)
        element.style.display = 'none'
        document.body.appendChild(element)
        element.click()
        document.body.removeChild(element)
    }

    let file = terminal.getFile(args.file)
    if (file.type == FileType.FOLDER)
        throw new Error("cannot download directory")
    downloadFile(file.name, file)
}, {
    description: "download a file",
    args: {"file": "the file to download"}
})

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

