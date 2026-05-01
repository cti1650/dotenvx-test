/**
 * dotenvx 動作確認用サンプルコード
 *
 * 使い方:
 *   npm run start        # .env を読み込んで実行
 *   npm run start:dev    # .env.development を読み込んで実行
 *   npm run start:prod   # .env.production を読み込んで実行
 */

console.log("=== dotenvx 動作確認 ===\n");

// 環境変数の表示
console.log("【読み込まれた環境変数】");
console.log(`  NODE_ENV: ${process.env.NODE_ENV || "(未設定)"}`);
console.log(`  APP_NAME: ${process.env.APP_NAME || "(未設定)"}`);
console.log(`  API_URL: ${process.env.API_URL || "(未設定)"}`);
console.log(`  SECRET_KEY: ${process.env.SECRET_KEY ? "***設定済み***" : "(未設定)"}`);
console.log(`  DATABASE_URL: ${process.env.DATABASE_URL || "(未設定)"}`);
console.log("");

// 変数展開の確認
if (process.env.EXPANDED_VAR) {
  console.log("【変数展開の確認】");
  console.log(`  EXPANDED_VAR: ${process.env.EXPANDED_VAR}`);
  console.log("");
}

console.log("=== 確認完了 ===");
