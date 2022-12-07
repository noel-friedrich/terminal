import os, json, re
files = [f for f in os.listdir("./js/commands")]
commands = {}

for file in files:
    if not file.endswith(".js") or file == "load-all.js":
        continue
    command_description = "undefined"
    with open("./js/commands/" + file, "r") as command_file:
        command_code = command_file.read()
        for line in reversed(command_code.split("\n")):
            match = re.match(r".*description\"?:\s\"(.+)\".*", line)
            if match:
                command_description = match[1]
                break
    
    commands[file[:-3]] = command_description

with open("./js/load-commands.js", "w") as file:
    dumps = json.dumps(commands)
    content = f"terminal.allCommands = {dumps}"
    file.write(content)

print(f"Successfully added {len(commands.items())} Commands to load-commands.js file.")