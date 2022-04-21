# How To Start

This is a tutorial about how to start the project and contribute to the project. For example, make some more generalized rules and fix bugs. Don't be worry. Most of the project start from the helloworld. Hopefully this helps.

## Before the Start

You should install the [vscode](https://code.visualstudio.com/) and npm. My development npm version is 8.5.5, and vscode is 1.66.2.

There is a more detialed tutorial about how to run the extension from the [official websit](https://code.visualstudio.com/api/get-started/your-first-extension). You can start from there.

## Clone the Project

```bash
git clone https://github.com/twoflypig/Ir
cd Ir
code .
```

Then you can open the project. Then press `ctrl+F5` to start a new vscode window with the ir extension as installed. Then, you can test the IR files.

## Generate the IR Files

First, you should install the [MindSpore](https://www.mindspore.cn/install) and cpu version to enough there. Then

```bash
python test_ir.py
```

It will generate the IR files under your directory like the followings:

```bash
(ms) ☁  ir [master] ⚡  ls
 00_parse_0000.ir                                   15_validate_0089.dot                                              opt_pass_13_comm_op_add_attrs_0069.ir
 00_parse_0001.dat                                  16_task_emit_0120.ir                                              opt_pass_13_comm_op_add_attrs_0070.dat
 00_parse_0002.dot                                  16_task_emit_0121.dat                                             opt_pass_13_comm_op_add_attrs_0071.dot
 01_symbol_resolve_0003.ir                          16_task_emit_0122.dot                                             opt_pass_1_opt_a_0033.ir
 01_symbol_resolve_0004.dat                         17_execute_0123.ir                                                opt_pass_1_opt_a_0034.dat
 01_symbol_resolve_0005.dot                         17_execute_0124.dat                                               opt_pass_1_opt_a_0035.dot
```

You can open `15_validate_0087.ir` to check you features.

## Key File

The most import file in the project is folllowings:

```bash
src/extension.ts  # The logic for finding the references
syntaxes/ir.tmLanguage.json # The color matching scope
```

That's all, if you meet any questions, please let me know.
