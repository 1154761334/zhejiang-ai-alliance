# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - link "会员登录" [ref=e4] [cursor=pointer]:
      - /url: /login
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e9]
        - heading "申请入会" [level=1] [ref=e11]
        - paragraph [ref=e12]: 请输入您的邮箱创建账号
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: 企业邮箱
          - textbox "企业邮箱" [disabled] [ref=e18]:
            - /placeholder: contact@企业邮箱.com
            - text: test_1773794189313@example.com
        - generic [ref=e19]:
          - generic [ref=e20]: 密码
          - textbox "密码" [disabled] [ref=e21]: TestPass2026!
        - button "申请入驻" [disabled] [ref=e22]:
          - img [ref=e23]
          - text: 申请入驻
      - paragraph [ref=e25]:
        - text: 点击继续，即代表您同意我们的
        - link "服务条款" [ref=e26] [cursor=pointer]:
          - /url: /terms
        - text: 和
        - link "隐私政策" [ref=e27] [cursor=pointer]:
          - /url: /privacy
        - text: 。
  - region "Notifications alt+T"
  - alert [ref=e28]
```