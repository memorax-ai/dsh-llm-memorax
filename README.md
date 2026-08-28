# dsh-llm-memorax

DSH 的 Memorax 模型预设。它不实现新的 LLM 适配器，而是配置 DSH 自带的 `@deepseek-ai/dsh-llm-pi-ai`，将 Memorax 的 DeepSeek V4 Flash 网关加入原生模型列表。

## 固定配置

- Provider：`memorax`
- 模型：`deepseek-v4-flash`
- 协议：OpenAI Responses
- Base URL：`http://127.0.0.1:3081/v1`，由本机窄桥接转发到 Memorax 网关
- 输入上下文上限：393,216 tokens（384K）
- 最大输出：131,072 tokens（128K）
- 输入：纯文本
- 推理：支持 `high` 与直接透传到上游的 `max`；保留 `off` 入口仅用于兼容 DSH 已保存的模型偏好

## 使用

在启动 DSH 前提供 API key：

```sh
export DEEPSEEK_FLASH_API_KEY='...'
```

安装并启用此 bundle 后，运行 `dsh-llm-memorax-bridge`，再在 DSH 的原生模型选择器中选择 `Memorax DeepSeek / DeepSeek V4 Flash`。源码仓库中也可以运行 `pnpm bridge`。凭据仍由 DSH 的原生凭据层按 `DEEPSEEK_FLASH_API_KEY` 读取；桥接不读取也不保存密钥，只透传 DSH 请求。

当前 Memorax 网关证书签发给 `deepseek-flash-api.memorax.space`，但服务端只接受 IP SNI。桥接固定连接该 IP，同时继续验证证书链，并按证书声明的域名校验证书；它只监听 `127.0.0.1`，避免影响 DSH 的其它 HTTPS 请求。

这个包只负责 Provider 和模型预设。网关部署、SSH、GPU 进程及服务维护不属于插件职责。
