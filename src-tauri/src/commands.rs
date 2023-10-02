use crate::{constant::TranslateQuery, crawler::alibaba};
use std::{thread, time};
use tauri::Window;

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
pub async fn console_log(text: String) {
    println!("=====【Debug】=====");
    println!("{}", text);
    println!("==================");
}
