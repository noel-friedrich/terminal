terminal.addCommand("whoami", async function() {
    terminal.printLine("fetching data...")

    function capitalize(str) {
        return str[0].toUpperCase() + str.slice(1)
    }

    const infos = {
        Localtime: new Date().toLocaleString(),
        Timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        Pageon: window.location.pathname,
        Referrer: document.referrer,
        PreviousSites: history.length,
        BrowserVersion1a: navigator.appVersion,
        BrowserVersion1b: navigator.userAgent,
        BrowserLanguage: navigator.language,
        BrowserOnline: navigator.onLine,
        BrowserPlatform: navigator.platform,
        JavaEnabled: navigator.javaEnabled(),
        DataCookiesEnabled: navigator.cookieEnabled,
        ScreenWidth: screen.width,
        ScreenHeight: screen.height,
        WindowWidth: innerWidth,
        WindowHeight: innerHeight,
        AvailWidth: screen.availWidth,
        AvailHeights: screen.availHeight,
        ScrColorDepth: screen.colorDepth,
        ScrPixelDepth: screen.pixelDepth,
    }

    try {
        let response = await (await fetch("https://api.db-ip.com/v2/free/self")).json()
        for (let [key, value] of Object.entries(response)) {
            infos[capitalize(key)] = value
        }
    } catch {}

    const longestInfoName = Math.max(...Object.keys(infos).map(k => k.length)) + 2
    for (let [infoName, infoContent] of Object.entries(infos)) {
        terminal.print(stringPadBack(infoName, longestInfoName), Color.COLOR_1)
        terminal.printLine(infoContent)
    }
}, {
    description: "get client info"
})