use serde::{Deserialize, Serialize};
use anyhow::Error;
use serde_json::from_str;

use crate::constant::TranslateQuery;

#[derive(Debug, Deserialize, Serialize)]
struct CsrfToken {
  token: String,
  #[serde(rename = "parameterName")]
  parameter_name: String,
  #[serde(rename = "headerName")]
  header_name: String,
}

pub async fn translate(query: TranslateQuery) -> Result<String, Error> {
  println!("Alibaba");
  // 获取csrftoken
  let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36".to_string();
  println!("{:?}", user_agent);
  let client = reqwest::Client::builder().cookie_store(true).build()?;
  let res = client.get("https://translate.alibaba.com/api/translate/csrftoken").
    header("User-Agent", &user_agent).
    send().await?.text().await?;
  println!("{:?}", res);
  // 获取json "{\"token\":\"136fd918-58a1-4d14-90b3-254cc15f9af7\",\"parameterName\":\"_csrf\",\"headerName\":\"X-XSRF-TOKEN_PROPERTY_ITEM\"}"
  let csrf_token: CsrfToken = from_str(&res)?;
  print!("{:?}", csrf_token);

  // 构建接口请求
  let token = csrf_token.token;
  let form_data = reqwest::multipart::Form::new().
    text("srcLang", query.source).
    text("tgtLang", query.target).
    text("domain", "general").
    text("query", query.text).
    text(csrf_token.parameter_name, token.to_string());
  let res2 =
    client.post("https://translate.alibaba.com/api/translate/text").
    header("User-Agent", &user_agent).
    header(csrf_token.header_name, token.to_string()).
    header("Content-Type", "multipart/form-data").
    multipart(form_data).send().await?.text().await?;

  println!("{:?}", res2);
  Ok(String::from(""))
}
