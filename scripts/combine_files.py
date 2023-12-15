import os

combined_content = ""

def add_file(file_name):
    global combined_content
    with open(file_name, "r", encoding="utf-8") as command_file:
        try:
            command_code = command_file.read()
        except Exception as e:
            print(f"Problem at {file_name}: failed to read file")
            print(e)
            exit()

        combined_content += f"\n// ------------------- {file_name} --------------------\n"
        combined_content += command_code + "\n"

def add_files(folder):
    files = [f for f in os.listdir(folder)]

    for file in files:
        if not file.endswith(".js") or file == "load-all.js":
            continue

        add_file(f"{folder}/{file}")

add_file("js/terminal.js")
add_file("js/load_async.js")
add_file("js/defaultFilesystem.js")
add_file("js/load-commands.js")
add_files("js/commands")
add_files("js/modules")

with open("js/combined.js", "w", encoding="utf-8") as file:
    file.write(combined_content)

lines = len(combined_content.split("\n"))
print(f"Created js/combined.js ({lines} lines)")