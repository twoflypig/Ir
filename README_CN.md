# IRColor README

![Visual Studio Marketplace Downloads](https://img.shields.io/visual-studio-marketplace/d/DayDayUp.ir) ![Visual Studio Marketplace Version](https://img.shields.io/visual-studio-marketplace/v/DayDayUp.ir) ![Visual Studio Marketplace Last Updated](https://img.shields.io/visual-studio-marketplace/last-updated/DayDayUp.ir)

IRColor是针对MindSpore开发者的一个IR文件着色的插件(最初开发的目的),来高亮由MindSpore产生的IR文件的关键字。旨在帮助用户和开发者来浏览IR文件。这个项目是由个人发起~期望帮助解决开发者一些经常遇到的问题，毕竟都2022年了。目前仍在开发阶段，希望各位孢子们多多提提意见。

PS:这个项目非官方项目~

>什么是MindSpore的IR文件?

可以参考这个链接[page](https://www.mindspore.cn/docs/programming_guide/zh-CN/r1.5/read_ir_files.html)


## 如何贡献

请参考此处的文档[document](./how_to_contribute.md).

## 目前的特性

1.在vscode的状态栏中增加操作算子的个数统计和子图数量的统计。

![example](images/count_operators.gif)

2.高亮IR文件中的算子操作符，scope name、tensor的shape和一些变量关键字。如下所示:

![example](images/highlight_feature.png)

2.支持如下的跳转功能

![example](images/ircolor.gif)

3.基于编号查找所有引用.

![example](images/find_reference.gif)

![example](images/find_reference_name.gif)

4.支持在子图内部之间跳转

![example](images/jump_inner_graphs.gif)

## Requirements

1. 目前着色效果是采用vscode中Monokai Dimmed主题后出现的.

## Extension Settings

None

## Known Issues

1. *.dat文件后缀并没有经过广泛的测试和支持.所以一些特性可能在dat文件上并不会生效.
2. 当前将参数变量作为搜索关键字时，只会认为ir文件中文件开始的变量为参数.

## Release Notes

See [CHANGELOG.md](CHANGELOG.md)

## Future Plans

See [RoadMap.md](RoadMap.md)

**Enjoy!**
