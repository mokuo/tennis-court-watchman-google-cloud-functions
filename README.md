# tennis-court-watchman

Serverless application to notify Slack of unreserved tennis court.

## デプロイ

### Cloud SDK の設定

Cloud SDK をインストール、設定しておく。以下などを参照。

- [Google Cloud SDK インストーラの使用  \|  Cloud SDK のドキュメント  \|  Google Cloud](https://cloud.google.com/sdk/docs/downloads-interactive?hl=ja)
- [Cloud SDK の初期化  \|  Cloud SDK のドキュメント  \|  Google Cloud](https://cloud.google.com/sdk/docs/initializing?hl=ja)

### 環境変数

```bash
cp .env.yaml.sample .env.yaml
```

### pubsub

トピックの作成

```bash
gcloud pubsub topics create watch-tennis-court
gcloud pubsub topics describe watch-tennis-court # 確認
```

### デプロイ

```bash
FUNCTION=watchShinjuku yarn deploy
```

### テスト

```bash
gcloud pubsub topics publish watch-tennis-court --message "test"
```

### Cloud Scheduler

```bash
gcloud beta scheduler jobs create pubsub watch --schedule "0 21 * * *" --topic watch-tennis-court --message-body "Watch"
```
