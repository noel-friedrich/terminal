from update_command_list import main as update_command_list_main, commands
update_command_list_main()

from build_command_pages import main as build_command_pages
build_command_pages(commands)

import generate_readme

import check_commands