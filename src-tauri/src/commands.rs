use brotli2::read::{BrotliDecoder, BrotliEncoder};
use mouse_position::mouse_position::Mouse;
use rdev::{simulate, EventType, Key};
use std::collections::HashMap;
use std::io::prelude::*;
use std::{thread, time};
use whatlang::detect;

fn send(event_type: &EventType) {
    let delay = time::Duration::from_millis(20);
    match simulate(event_type) {
        Ok(()) => (),
        Err(_) => {
            println!("We could not send {:?}", event_type);
        }
    }
    // Let ths OS catchup (at least MacOS)
    thread::sleep(delay);
}

#[tauri::command]
pub fn console_log(text: String) {
    println!("【Debug】=========");
    println!("{}", text);
    println!("==================");
}

#[tauri::command]
pub async fn get_mouse_position() -> Result<(i32, i32), ()> {
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => Ok((x, y)),
        Mouse::Error => Err(()),
    }
}

#[tauri::command]
pub async fn get_text_lang(text: String) -> Result<String, ()> {
    let info = detect(&text).unwrap();
    Ok(info.lang().code().to_string())
}

#[tauri::command]
pub async fn auto_copy() {
    thread::sleep(time::Duration::from_millis(400));

    #[cfg(target_os = "windows")]
    send(&EventType::KeyPress(Key::ControlLeft));
    #[cfg(target_os = "macos")]
    send(&EventType::KeyPress(Key::MetaLeft));

    send(&EventType::KeyPress(Key::KeyC));
    send(&EventType::KeyRelease(Key::KeyC));

    #[cfg(target_os = "windows")]
    send(&EventType::KeyRelease(Key::ControlLeft));
    #[cfg(target_os = "macos")]
    send(&EventType::KeyRelease(Key::MetaLeft));
}

#[tauri::command]
pub fn brotli_parse(text: HashMap<String, u8>) -> Result<String, ()> {
    let mut data = Vec::new();
    for (_key, value) in text {
        let value_bytes = value.to_string().into_bytes();
        data.extend_from_slice(&value_bytes);
    }
    let slice_of_data: &[u8] = &data;
    // let compressor = BrotliEncoder::new(slice_of_data, 6);
    let mut decompressor = BrotliDecoder::new(slice_of_data);
    let mut result = String::new();
    decompressor.read_to_string(&mut result).unwrap();
    Ok(result)
}
