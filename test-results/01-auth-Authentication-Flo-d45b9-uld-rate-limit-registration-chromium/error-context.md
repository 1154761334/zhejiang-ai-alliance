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
          - textbox "企业邮箱" [ref=e18]:
            - /placeholder: contact@企业邮箱.com
        - generic [ref=e19]:
          - generic [ref=e20]: 密码
          - textbox "密码" [ref=e21]
        - button "申请入驻" [ref=e22] [cursor=pointer]
      - paragraph [ref=e23]:
        - text: 点击继续，即代表您同意我们的
        - link "服务条款" [ref=e24] [cursor=pointer]:
          - /url: /terms
        - text: 和
        - link "隐私政策" [ref=e25] [cursor=pointer]:
          - /url: /privacy
        - text: 。
  - region "Notifications alt+T"
```