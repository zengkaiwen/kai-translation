use brotli2::read::BrotliDecoder;
use mouse_position::mouse_position::Mouse;
use rdev::{simulate, EventType, Key};
use std::io::Read;
use std::{thread, time};
use whatlang::detect;

#[cfg(target_os = "macos")]
use macos_accessibility_client::accessibility;

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
pub fn console_log(text: String, time: String) {
    println!("Debug {}", time);
    println!("├── {}", text);
    println!("└────────────────────────────────────");
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
    #[cfg(target_os = "macos")]
    {
        let trusted = accessibility::application_is_trusted_with_prompt();
        if trusted {
            thread::sleep(time::Duration::from_millis(400));

            send(&EventType::KeyPress(Key::MetaLeft));
            send(&EventType::KeyPress(Key::KeyC));
            send(&EventType::KeyRelease(Key::KeyC));
            send(&EventType::KeyRelease(Key::MetaLeft));
        }
    }

    #[cfg(target_os = "windows")]
    {
        thread::sleep(time::Duration::from_millis(400));
        send(&EventType::KeyPress(Key::ControlLeft));
        send(&EventType::KeyPress(Key::KeyC));
        send(&EventType::KeyRelease(Key::KeyC));
        send(&EventType::KeyRelease(Key::ControlLeft));
    }
}

#[tauri::command]
pub fn brotli_parse(data: String) -> Result<String, ()> {
    // Parse the string data into a vector.
    let vec: Result<Vec<u8>, _> = data.split(',').map(|s| s.trim().parse::<u8>()).collect();
    let vec = match vec {
        Ok(v) => v, // If parsing successful, use the parsed vector.
        Err(_) => {
            // If parsing failed, return an error result.
            println!("{}: {}", "vec", "error");
            return Err(());
        }
    };

    // Try to create the BrotliDecoder and decompress the data.
    let mut decompressor = BrotliDecoder::new(&vec[..]);
    let mut result = vec![];
    if let Err(e) = decompressor.read_to_end(&mut result) {
        println!("read_to_end failed: {:?}", e);
        return Err(());
    }

    // Try to convert the decompressed data into a String.
    match String::from_utf8(result) {
        Ok(s) => Ok(s),
        Err(e) => {
            println!("Conversion to string failed: {:?}", e);
            Err(())
        }
    }
}
