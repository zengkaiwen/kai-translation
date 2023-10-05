# 常见问题

## 1、Mac 里面打开软件，报 “已损坏或未知开发者”

这是因为目前软件处于 Beta 版本中，未经过苹果官方的签名验证，解决方案：

1、打开 Mac 终端，如图这个软件：

![终端](../images/terminal.png ':size=12%')

2、输入命令

```bash
sudo xattr -rd com.apple.quarantine /Applications/zeus.app
```

在下面的 `password:` 后面输入开机密码（输入密码的时候不会显示），按下回车键即可，然后再重启 zeus 软件

## 2、v0.0.2 怎么关闭窗口

点击右上角的这个图标，如图：

![关闭窗口](../images/how_to_hide.png ':size=40%')
