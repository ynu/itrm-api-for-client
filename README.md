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
    type,   // 类型，包括：create, delete, update,
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
        language,   // 语言, ISO639代码，例如:en
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
    dept, // Department, 所属部门,
    type, // 类型，包括：1 订阅号，2. 服务号，3. 企业号，4. 小程序
    certification: {, // 认证情况
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
    kbrq, // Date 开办日期
    creation, // Creation 数据创建信息
    cetification: {, // 认证情况
        dqrq, // Date, 到期日期
        zt, // 认证主体
    },
}
```

### 公共电子邮箱(Email)

```javascript
{
    account,    // 邮箱账号
    manager,    // 管理员
    yt, // 用途
    ktrq,   // 开通日期
    dept,   // Department 所属部门
    creation,   // Creation, 数据创建信息
}
```
### Dashboard
提供首页显示的数据

```javascript
{
    departments: {  // 部门数据
        totalCount, // 总数
    }
    websites: { // 网站数据
        totalCount,     // 总数 
    },
    wechatOfficialAccounts: {   // 微信公众号
        totalCount,
    },
    weiboAccounts: {    // 微博账号
        totalCount,
    },
    emails: {   // 公共邮箱
        totalCount,
    }
}
```


## 系统角色
为便于读资源进行管理和存取控制，系统内置以下角色：
- 系统管理员(admin)。系统管理员可管理系统中的所有资源；
- 部门管理员(dept-admin-<deptId>)。部门管理员可以管理指定部门的所有资源；
- 资源管理员(resource-admin-<resourceId>)。资源管理员可以管理指定资源；

## 资源管理规则
系统可以管理包括网站及应用系统、微博账号、微信公众号、公共邮箱等在内各种资源。对资源的管理应遵循以下规则：

- 创建资源时都应该在资源数据记录中添加创建信息；
- 任何资源的创建、修改、删除都应当创建修改记录，修改记录的详细程度可根据资源的重要程度自行确定；
- 所有资源都是用 id 字段作为唯一ID；
- 在查看资源时，必须对当前用户进行身份验证，一般规则包括：
    - 未登录用户不能读取任何未被标记为公开的资源，或已公开资源的未公开数据字段；
    - 无特殊权限的登录用户仅能读取自己添加的资源数据；
    - 部门主要负责人和保密审查员可以查看本部门所有资源；

## API
被项目 API 主要提供给 aor 客户端使用，采用 SimpleREST 标准，因此，所有资源都必须具备以下 API：

- `GET_LIST` 获取资源列表 `?sort=['title','ASC']&range=[0, 9]&filter={title:'bar'}` 
    - sort 排序字段
    - range 数据分页
    - filter 过滤器 
- `GET_ONE` 获取指定资源 `GET /:id`
    - id 指定的资源ID。
- `CREATE` 创建资源 `POST /`
    - 所有提交的数据均在 BODY 中
- `UPDATE` 更新资源 `PUT /:id`
    - id 指定资源的 ID；
    - 所有需要更新的数据均在 BODY 中。
- `DELETE` 删除资源 `DELETE /:id`
    - id 指定资源的 ID；
- `GET_MANY` 批量获取资源 `GET ?filter={ids:[123,456,789]}`
    - filter 过滤器 