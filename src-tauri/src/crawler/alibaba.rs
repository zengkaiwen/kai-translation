use rand_user_agent::UserAgent;

use crate::constant::TranslateQuery;

pub async fn translate(_query: TranslateQuery) -> Result<String, reqwest::Error> {
  println!("Alibaba");
  let user_agent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/116.0.0.0 Safari/537.36".to_string();
  println!("{:?}", user_agent);
  let client = reqwest::Client::new();
  let res = client.get("https://translate.alibaba.com/api/translate/csrftoken").
    header("User-Agent", user_agent).
    send().await?.text().await?;
  // 获取json "{\"token\":\"136fd918-58a1-4d14-90b3-254cc15f9af7\",\"parameterName\":\"_csrf\",\"headerName\":\"X-XSRF-TOKEN_PROPERTY_ITEM\"}"
  println!("{:?}", res);
  Ok(String::from(""))
}
