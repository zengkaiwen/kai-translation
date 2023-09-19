use crate::{crawler::alibaba, constant::TranslateQuery};

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
