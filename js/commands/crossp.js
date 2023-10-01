terminal.addCommand("crossp", function(args) {
    const x = args.y1 * args.z2 - args.z1 * args.y2
    const y = args.z1 * args.x2 - args.x1 * args.z2
    const z = args.x1 * args.y2 - args.y1 * args.x2

    terminal.printLine(`< ${x}, ${y}, ${z} >`)
}, {
    description: "calculate the cross product of 2 3d vectors",
    args: {
        "x1:n": "the x component of the first vector",
        "y1:n": "the y component of the first vector",
        "z1:n": "the z component of the first vector",
        "x2:n": "the x component of the second vector",
        "y2:n": "the y component of the second vector",
        "z2:n": "the z component of the second vector"
    }
})