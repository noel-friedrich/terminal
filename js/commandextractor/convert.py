def writeCommand(name, code):
    with open(f"./js/commands/{name}.js", "w") as file:
        file.write(code)

lines = []
with open("./js/commandextractor/input.txt", "r") as file:
    lines = file.read().split("\n")

import re

temp = ""
currname = ""
for line in lines:
    if line.startswith("terminal.addCommand"):
        code = temp
        temp = ""
        if currname:
            writeCommand(currname, code)
        currname = re.match(r"terminal\.addCommand\(\"(.+)\".+", line)[1]

    temp += line + "\n"

writeCommand(currname, temp)