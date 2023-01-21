terminal.addCommand("search", async function(args) {
    terminal.href(args.b + encodeURIComponent(args.query))
}, {
    description: "search something via google.com",
    args: {
        "*query": "the search query",
        "?b=baseUrl": "the base search-engine url"
    },
    standardVals: {
        b: "https://www.google.com/search?q="
    }
})

