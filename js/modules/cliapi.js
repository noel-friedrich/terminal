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

}

terminal.modules.cliapi = CliApi