import os
files = [f for f in os.listdir("./js/commands")]

combined_content = ""

for file in files:
    if not file.endswith(".js") or file == "load-all.js":
        continue
    with open("./js/commands/" + file, "r", encoding="utf-8") as command_file:
        try:
            command_code = command_file.read()
        except Exception as e:
            print(f"Problem at {command_name} command: failed to read command file")
            print(e)
            exit()

        combined_content += f"// ------------------- {file} --------------------\n"
        combined_content += command_code + "\n"

with open("./js/combined.js", "w", encoding="utf-8") as file:
    file.write(combined_content)

print("Created js/combined.js")