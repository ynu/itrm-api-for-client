# itrm-api-for-client
ITRM API for Client with cookie authentication

## 数据结构

### 人员（Person）

```javascript
{
    id, //唯一id，一般使用一卡通号
    name,   // 姓名
    zw, // 职务
    email, // 电子邮件
    phone, // 手机号码
}
```

### 创建信息(Creation)
创建数据时需要保持的信息

```javascript
{
    date,   // Date, 创建时间
    creator,    // Person, 创建者
}
```

### 资源(Resource)
用于表示系统中所使用的各类资源

```javascript
{
    category, // 资源类型，例如，website、deparment等
    id, // 资源Id
}
```
### 修改日志(ChangeLog)
用于记录重要数据的修改记录

```javascript
{
    date, // 修改日期
    operator, // Person, 操作者
    resource,   // Resource, 被修改的资源
    note,    // 修改记录，例如"原名称xxx修改为yyy"
}
```

### 审核记录(AuditLog)
资源的审核记录

```javascript
{
    date,   // 审核日期
    reource,    // 被审核的资源
    dept, // 进行审核的单位
    creation, // 数据记录创建信息
    conclusion: {   // 审核结果
        pass, // boolean, 是否通过
    }
}
```

### 责任主体（Department）

```javascript
{
    id,                 // 唯一Id
    name,               // 单位名称
    zyfzr: {},  // Person, 主要负责人
    bmscy: {},              // Person, 保密审查员
    resManagers: [{}],  // Person数组，资源管理员列表       
}
```

### 网站及应用程序（website）

```javascript
{
    name,   // 名称
    domain, //域名
    mainPageUrl,    // 首页地址
    category,       // 数字，1. 门户网站；2. 应用系统
    kbrq,       // Date, 开办日期
    icp, // ICP备案号
    yt,     // 用途
    dept: {},   // Department，所属部门，id 为必须字段，其余字段可选
    manager: {},    // Person 管理员，id 为必须字段
    i18nEdition: [{     // 网站国际化版本信息
        language,   // 语言
        mainPageUrl,    // 首页
    }],
    creation,   // Creation, 数据创建信息
    providerInfo: {, // 服务器情况
        tgfs,   // 托管方式, 1. 站群;2. 数据中心虚拟机; 3. 自有服务器; 4. 校外第三方服务商
        realServers: [], // 服务器地址及端口，例如：'202.203.20.23:8080' 
        remark, // 备注，主要记录网站不在站群系统或虚拟机的原因
    },
    auditConclusion: {  // 审核情况
        self,   // AuditLog, 责任单位审核情况
        itc, // AuditLog, 信息技术中心审核情况
        bmw, // AuditLog, 校保密委审核情况
        xcb, // Auditlog, 宣传部审核情况
    }
    
}
```

### 微信公众号(WeChatOfficalAccount)

```javascript
{
    account, // 微信号
    name, // 名称
    kbrq, // 开办日期
    dept, // Department, 所属部门
    cetification: {, // 认证情况
        dqrq, // Date, 到期日期
        zt, // 认证主体
    },
    manager, // Person, 账号管理员
    creation, // Creation 数据创建信息
}
```

### 微博账号(WeiboAccount)

```javascript
{
    account, // 账号
    name,   // 名称
    url,    // 地址
    manager, // Person, 管理员
    creation, // Creation 数据创建信息
    cetification: {, // 认证情况
        dqrq, // Date, 到期日期
        zt, // 认证主体
    },
}
```
