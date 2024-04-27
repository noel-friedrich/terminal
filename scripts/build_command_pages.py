import os, shutil, json

def main(commands):

    commands_folder_path = "gui"
    command_template_html = "scripts/templates/command_template.html"

    def remove_folder_contents(folder):
        for filename in os.listdir(folder):
            file_path = os.path.join(folder, filename)
            try:
                if os.path.isdir(file_path):
                    shutil.rmtree(file_path)
            except Exception as e:
                print(f"Failed to delete {file_path}. Reason: {e}")

    remove_folder_contents(commands_folder_path)

    for command, info in commands.items():
        info["name"] = command
        info["code-url"] = f"https://github.com/noel-friedrich/terminal/blob/main/js/commands/{command}.js"
        info["json"] = json.dumps(info)
        with open(command_template_html, "r") as template_file:
            content = template_file.read()
            for key, value in info.items():
                content = content.replace(f"${key}$", str(value))
            
            folder_path = f"{commands_folder_path}/{command}"
            os.makedirs(folder_path)
            with open(f"{folder_path}/index.html", "w") as file:
                file.write(content)
    
    print("Successfully created command-pages")

if __name__ == "__main__":
    from update_command_list import commands
    main(commands)