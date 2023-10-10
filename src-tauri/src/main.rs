// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;

#[cfg(target_os = "windows")]
use mouse_position::mouse_position::Mouse;
#[cfg(target_os = "windows")]
use rdev::{listen, Button, EventType};
use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

#[derive(Clone, serde::Serialize)]
struct SystemTrayPayload {
    id: String,
}

#[derive(Clone, serde::Serialize)]
struct MousePayload {
    x: i32,
    y: i32,
}

fn main() {
    let item_version = CustomMenuItem::new("version".to_string(), "zeus v0.0.3").disabled();
    let item_show = CustomMenuItem::new("show".to_string(), "输入翻译");
    let item_setting = CustomMenuItem::new("setting".to_string(), "偏好设置");
    let item_about = CustomMenuItem::new("about".to_string(), "关于");
    let item_quit = CustomMenuItem::new("quit".to_string(), "退出");
    let tray_menu = SystemTrayMenu::new()
        .add_item(item_version)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(item_setting)
        .add_item(item_show)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(item_about)
        .add_item(item_quit);
    let system_tray = SystemTray::new();

    tauri::Builder::default()
        .system_tray(system_tray.with_menu(tray_menu))
        .on_system_tray_event(|app, event| match event {
            SystemTrayEvent::MenuItemClick { id, .. } => match id.as_str() {
                "quit" => {
                    std::process::exit(0);
                }
                _ => {
                    app.emit_all("systemTray", SystemTrayPayload { id: id })
                        .unwrap();
                }
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::console_log,
            commands::get_mouse_position,
            commands::get_text_lang,
            commands::auto_copy,
        ])
        .setup(|app| {
            // 隐藏MacOS程序坞上的图标
            #[cfg(target_os = "macos")]
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);

            #[cfg(target_os = "windows")]
            let app_handle = app.handle();

            // 获取鼠标点击时的坐标，以事件方式传递给前端
            #[cfg(target_os = "windows")]
            tauri::async_runtime::spawn(async move {
                listen(move |event| match event.event_type {
                    EventType::ButtonPress(button) => {
                        if Button::Left == button {
                            let position = Mouse::get_mouse_position();
                            match position {
                                Mouse::Position { x, y } => {
                                    app_handle
                                        .clone()
                                        .emit_all("mousePress", MousePayload { x, y })
                                        .unwrap();
                                }
                                Mouse::Error => println!("error while getting mouse position"),
                            }
                        }
                    }
                    _ => (),
                })
                .unwrap();
            });

            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
