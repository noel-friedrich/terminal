terminal.addCommand("search", async function(args) {
    let combinedUrl = args.b + encodeURIComponent(args.query)
    window.location.href = combinedUrl
}, {
    description: "search something via google.com",
    args: {
        "*query": "the search query",
        "?b": "the base search-engine url"
    },
    standardVals: {
        b: "https://www.google.com/search?q="
    }
})

