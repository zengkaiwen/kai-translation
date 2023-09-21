use crate::{crawler::alibaba, constant::TranslateQuery};
use std::{thread, time};
use tauri::Window;
use enigo::{Enigo, Key, KeyboardControllable};

#[tauri::command]
pub async fn alibaba_transform(source: String, target: String, text: String) -> Result<String, ()> {
  let query = TranslateQuery{
    source,
    target,
    text,
  };
  let res = alibaba::translate(query).await;
  match res {
    Ok(result) => Ok(result),
    Err(_) => Err(()),
  }
}

#[tauri::command]
pub async fn console_log(text: String) {
  println!("=====【Debug】=====");
  println!("{}", text);
  println!("==================");
}

#[tauri::command]
pub async fn shortcut_control(window: Window) -> Result<String, ()> {
  println!("初始化enigo");
  thread::sleep(time::Duration::from_millis(100));
  // 自动执行 ctrl+c 将内容拷贝到剪贴板
  let mut enigo = Enigo::new();
  // write text
  enigo.key_sequence("Hello World! here is a lot of text  ❤️");

  // select all
  // enigo.key_down(Key::Control);
  // enigo.key_click(Key::Layout('a'));
  // enigo.key_up(Key::Control);
  // 读取剪贴板最新文本，看是否存在
  // 不存在的话，返回空字符串
  // 存在的话，获取当前鼠标所在位置，显示窗口，显示成功后
  let _ = window.show();
  // 移动鼠标到窗口内，执行鼠标点击，触发 window focus
  // 返回剪贴板文本/*  */
  Ok("shortcut_control".to_string())
}
