use std::collections::HashMap;

use serde::{Deserialize, Serialize};
use anyhow::Error;
use serde_json::from_str;

use crate::constant::TranslateQuery;

#[derive(Debug, Deserialize, Serialize)]
#[serde(rename_all = "camelCase")]
struct CsrfToken {
  token: String,
  parameter_name: String,
  header_name: String,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Response {
    code: String,
    data: Data,
    http_status_code: i64,
    message: String,
    request_id: String,
    success: bool,
}

#[derive(Serialize, Deserialize)]
#[serde(rename_all = "camelCase")]
struct Data {
    detect_language: String,
    translate_text: String,
}

pub async fn translate(query: TranslateQuery) -> Result<String, Error> {
  // println!("Alibaba");
  // 获取csrftoken "{\"token\":\"136fd918-58a1-4d14-90b3-254cc15f9af7\",\"parameterName\":\"_csrf\",\"headerName\":\"X-XSRF-TOKEN_PROPERTY_ITEM\"}"
  let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36".to_string();
  let client = reqwest::Client::builder().build()?;
  let res = client.get("https://translate.alibaba.com/api/translate/csrftoken").
    header("User-Agent", &user_agent).
    send().await?.text().await?;
  let csrf_token: CsrfToken = from_str(&res)?;
  // print!("==== csrfToken: {:?}", csrf_token);

  // 构建请求的数据
  let token = csrf_token.token;
  let mut params = HashMap::new();
  params.insert("srcLang", query.source);
  params.insert("tgtLang", query.target);
  params.insert("domain", "general".to_string());
  params.insert("query", query.text);
  params.insert(&csrf_token.parameter_name, token.to_string());
  // println!("====== form_dat: {:?}", params);

  // 发送请求
  let res2 =
    client.post("https://translate.alibaba.com/api/translate/text").
    header("User-Agent", &user_agent).
    header(csrf_token.header_name, token.to_string()).
    header("Content-Type", "multipart/form-data").
    form(&params)
    .send().await?.text().await?;
  println!("===== result {:?}", res2);

  let data: Response = from_str(&res2)?;

  Ok(data.data.translate_text)
}
