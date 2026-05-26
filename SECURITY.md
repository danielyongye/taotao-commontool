# 安全说明（公开仓库）

## 切勿提交

- 微信小程序 **AppSecret**（小程序密钥）
- 任何 **access_token**、**session_key**、支付密钥、证书（`.pem` / `.p12`）
- 数据库、OSS、第三方 API 的 **Secret / 密码**
- `.env`、`.env.local`、`.env.production` 等含真实密钥的文件
- CI/CD Token、个人访问令牌

## AppID

微信小程序 **AppID** 不是密钥，但公开仓库中建议使用占位符，由每位开发者在本地填写（见 README「公开仓库配置」）。

## 发现泄露

若误将密钥提交到 GitHub，请立即：

1. 在对应平台 **轮换 / 作废** 该密钥  
2. 从仓库移除敏感内容，并视情况清理 Git 历史（`git filter-repo` 等）  
3. 通过 GitHub Security Advisories 或仓库 Issues 告知维护者（如适用）
