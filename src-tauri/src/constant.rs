pub struct TranslateQuery {
  pub source: String,
  pub target: String,
  pub text: String,
}

// #[derive(Debug, Clone, Copy, Eq, PartialEq, Hash)]
// pub enum Language {
//   /// 英语
//   English,
//   /// 法语
//   French,
//   /// 德语
//   German,
//   /// 西班牙语
//   Spanish,
//   /// 日语
//   Japanese,
//   /// 韩语
//   Korean,
//   /// 汉语
//   Chinese,
//   /// 泰语
//   Thai,
//   /// 葡萄牙语
//   Portuguese,
// }

// impl Language {
//   pub fn get_alibaba_code(&self) -> Option<&'static str> {
//     let code = match self {
//       Language::English => "en",
//       Language::French => "fr",
//       Language::German => "de",
//       Language::Spanish => "es",
//       Language::Japanese => "ja",
//       Language::Korean => "ko",
//       Language::Chinese => "zh",
//       Language::Thai => "th",
//       Language::Portuguese => "pt",
//     };
//     Some(code)
//   }
// }
