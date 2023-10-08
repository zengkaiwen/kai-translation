use mouse_position::mouse_position::Mouse;
use rdev::{EventType, Key, simulate};
use whatlang::detect;
use std::{time, thread};

use crate::{constant::TranslateQuery, crawler::alibaba};

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
pub async fn alibaba_transform(source: String, target: String, text: String) -> Result<String, ()> {
    let query = TranslateQuery {
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
pub fn console_log(text: String) {
    println!("【Debug】=========");
    println!("{}", text);
    println!("==================");
}

#[tauri::command]
pub async fn get_mouse_position() ->  Result<(i32, i32), ()>{
    let position = Mouse::get_mouse_position();
    match position {
        Mouse::Position { x, y } => {
            Ok((x, y))
        },
        Mouse::Error => {
            Err(())
        }
    }
}

#[tauri::command]
pub async fn get_text_lang(text: String) -> Result<String, ()> {
    let info = detect(&text).unwrap();
    Ok(info.lang().code().to_string())
}

#[tauri::command]
pub async fn auto_copy() {
    thread::sleep(time::Duration::from_millis(500));

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

    thread::sleep(time::Duration::from_millis(50));
}
