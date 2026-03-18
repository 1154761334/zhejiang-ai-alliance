# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e3]:
    - link "返回首页" [ref=e4] [cursor=pointer]:
      - /url: /
      - img [ref=e5]
      - text: 返回首页
    - generic [ref=e7]:
      - generic [ref=e8]:
        - img [ref=e9]
        - heading "欢迎回来" [level=1] [ref=e11]
        - paragraph [ref=e12]: 请输入您的邮箱进行登录
      - generic [ref=e15]:
        - generic [ref=e16]:
          - generic [ref=e17]: 企业邮箱
          - textbox "企业邮箱" [disabled] [ref=e18]:
            - /placeholder: contact@企业邮箱.com
            - text: test_1773794189313@example.com
        - generic [ref=e19]:
          - generic [ref=e20]: 密码
          - textbox "密码" [disabled] [ref=e21]: TestPass2026!
        - button "登录" [disabled] [ref=e22]:
          - img [ref=e23]
          - text: 登录
      - paragraph [ref=e25]:
        - link "还没有账号？申请入会" [ref=e26] [cursor=pointer]:
          - /url: /register
  - region "Notifications alt+T"
  - alert [ref=e27]
```