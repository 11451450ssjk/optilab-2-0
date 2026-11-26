# OptiLab 科研服务部署

`research-services.worker.js` 同时提供两项服务：

- `POST /ai`：浏览器把 OpenAI 兼容请求发给代理，真实模型密钥只保存在 Worker 中。
- `GET/PUT /projects/:room`：保存端到端加密后的项目信封，服务端看不到项目正文。

## Cloudflare Workers

1. 安装 Wrangler 并登录 Cloudflare。
2. 将 `wrangler.toml.example` 复制为 `wrangler.toml`，填写 KV namespace ID。
3. 执行：

```powershell
wrangler secret put UPSTREAM_AI_URL
wrangler secret put UPSTREAM_AI_KEY
wrangler secret put PROJECT_SYNC_TOKEN
wrangler secret put PROXY_ACCESS_TOKEN
wrangler deploy
```

网站“AI 与云同步”页面填写：

- AI 代理地址：`https://<worker-domain>/ai`
- 云同步地址：`https://<worker-domain>/projects`
- 项目空间 ID：自定义名称，例如 `optilab-team-01`

浏览器加密口令不会发送到 Worker。除 AI 请求正文外，项目同步数据始终以 AES-GCM 密文存储。
