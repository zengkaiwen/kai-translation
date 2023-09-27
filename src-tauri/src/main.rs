// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod commands;
mod constant;
mod crawler;

use tauri::{
    CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu, SystemTrayMenuItem,
};

#[derive(Clone, serde::Serialize)]
struct Payload {
    id: String,
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
                _ => {
                    app.emit_all("systemTray", Payload { id: id }).unwrap();
                }
            },
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            commands::alibaba_transform,
            commands::console_log,
            commands::shortcut_control,
        ])
        .setup(|app| {
            // 隐藏MacOS程序坞上的图标
            app.set_activation_policy(tauri::ActivationPolicy::Accessory);
            Ok(())
        })
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
