terminal.addCommand("changes", async function(args) {
    async function get(url) {
        return new Promise(async (resolve, reject) => {
            const result = await fetch(url)
            const json = await result.json()

            if (json.message.startsWith("API rate limit exceeded")) {
                reject(new Error("Github API rate limit exceeded"))
            }

            resolve(json)
        })
    }

    const branchesApiUrl = `https://api.github.com/repos/noel-friedrich/terminal/branches`
    const branches = await get(branchesApiUrl)

    const branch = branches.find(b => b.name == args.branch)
    if (!branch) {
        throw new Error(`Branch "${args.branch}" not found`)
    }

    terminal.printLine(`Showing changes to branch "${args.branch}"`, Color.COLOR_1)

    let nextCommitUrl = branch.commit.url
    for (let i = 0; i < args.limit && nextCommitUrl; i++) {
        const commitData = await get(nextCommitUrl)
        const stats = commitData.stats
        const date = new Date(commitData.commit.committer.date)
        const dateString = (
            date.getDate().toString().padStart(2, "0")
            + "." + (date.getMonth() + 1).toString().padStart(2, "0")
            + "." + (date.getFullYear()).toString()
        )
        terminal.print(`[${dateString}, +${stats.additions}, -${stats.deletions}] `)
        terminal.printLine(commitData.commit.message)
        nextCommitUrl = commitData.parents[0].url
    }
}, {
    description: "see latest changes to the terminal",
    args: {
        "?b=branch:s": "git branch to view changes of",
        "?l=limit:i:1~9999999": "number of changes to show"
    },
    defaultValues: {
        branch: "main",
        limit: 10
    },
    isSecret: true,
})