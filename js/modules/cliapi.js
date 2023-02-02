class CliApi {

    static urlBase = "api/"

    static KEY_REGEX = /^[a-zA-Z\_\-][a-zA-Z\_\-0-9\#\~]*$/

    static async get(name) {
        let url = `${CliApi.urlBase}get.php?key=${encodeURIComponent(name)}`
        return await fetch(url).then(response => response.text())
    }

    static async set(name, value) {
        let url = `${CliApi.urlBase}set.php`
        return await fetch(`${url}?key=${encodeURIComponent(name)}&value=${encodeURIComponent(value)}`)
    }

    static async pullFile(name) {
        let url = `${CliApi.urlBase}pull_file.php?key=${encodeURIComponent(name)}`
        return await fetch(url).then(response => response.text())
    }

    static async pushFile(name, content) {
        let url = `${CliApi.urlBase}push_file.php`
        let formData = new FormData()
        formData.append("file_name", name)
        formData.append("content", content)
        let result = await fetch(url, {
            method: "POST",
            body: formData
        }).then(response => response.json())
        return result
    }

}

terminal.modules.cliapi = CliApi