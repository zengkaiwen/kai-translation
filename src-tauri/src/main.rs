// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

mod crawler;
mod constant;
mod commands;

fn main() {
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![
          commands::alibaba_transform,
          commands::console_log,
          commands::shortcut_control,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
