use mouse_position::mouse_position::Mouse;
use whatlang::detect;

use crate::{constant::TranslateQuery, crawler::alibaba};

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
    println!("=====【Debug】=====");
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
