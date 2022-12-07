terminal.addCommand("w", function() {
    terminal.printf`USER   TIME_ELAPSED\n`
    terminal.printf`${{[Color.COLOR_1]: "root"}}   ${{[Color.LIGHT_GREEN]: ((Date.now() - START_TIME) / 1000) + "s"}}\n`
}, {
    description: "print the current time elapsed"
})

