import os, json, re
files = [f for f in os.listdir("./js/commands")]
commands = {}

for file in files:
    if not file.endswith(".js") or file == "load-all.js":
        continue
    command_description = "undefined"
    command_name = file[:-3]
    command_data = None
    with open("./js/commands/" + file, "r", encoding="utf-8") as command_file:
        try:
            command_code = command_file.read()
        except Exception as e:
            print(f"Problem at {command_name} command: failed to read command file")
            print(e)
            exit()
        for line in reversed(command_code.split("\n")):
            match = re.match(r".*description\"?:\s\"(.+)\".*", line)
            if match:
                command_description = match[1]
                break

        curr_code = ""
        sanitized_code = re.sub(r"\s([a-zA-Z_]*[^\"]):", ' "\\1":', command_code.strip()[:-1])
        sanitized_code = re.sub(r"[a-zA-Z_][a-zA-Z_0-9]*\(.*\)\s*{[^}]*}", "", sanitized_code)
        sanitized_code = re.sub(r",\s*\n?\s*}", "}", sanitized_code)
        for char in reversed(sanitized_code):
            curr_code = char + curr_code
            try:
                command_data = json.loads(curr_code)
            except:
                pass
        if command_data == None:
            print(sanitized_code)
            print(f"Problem at {command_name} command: failed to parse command data")
            exit()
    
    commands[command_name] = command_data

def main():
    with open("./js/load-commands.js", "w") as file:
        dumps = json.dumps(commands)
        content = f"terminal.commandData = {dumps}"
        file.write(content)

    print(f"Successfully added {len(commands.items())} Commands to load-commands.js file.")

if __name__ == "__main__":
    main()