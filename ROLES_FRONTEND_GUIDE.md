# Руководство по работе с ролями для фронтенда

## Быстрый старт

### Два способа назначения разрешений:

1. **Готовые роли (пресеты)** - Director, Admin, Manager, и т.д.
2. **Кастомные роли** - создаете свою роль с нужными разрешениями

---

## 1. Работа с готовыми ролями (пресеты)

### Получить список всех системных ролей с описаниями

```http
GET /roles/system-roles
```

**Ответ:**
```json
{
  "systemRoles": [
    {
      "name": "Director",
      "description": "Full system access with all permissions. Can manage all aspects of the system including roles and users.",
      "permissions": ["users:read", "users:create", "users:update", ...],
      "permissionsCount": 87
    },
    {
      "name": "Admin",
      "description": "Administrative access to most system features. Cannot modify or assign roles.",
      "permissions": ["users:read", "users:create", ...],
      "permissionsCount": 84
    },
    {
      "name": "Technical Specialist",
      "description": "Production and technical operations. Manages tasks, production planning, inventory, and technical workflows.",
      "permissions": ["tasks:read", "tasks:create", "production:plan", ...],
      "permissionsCount": 23
    },
    {
      "name": "Sales Manager",
      "description": "Sales and customer relations. Handles orders, pricing, quotes, contractors, and pipeline management.",
      "permissions": ["orders:read", "orders:create", "pricing:read", ...],
      "permissionsCount": 21
    },
    {
      "name": "Storekeeper",
      "description": "Warehouse operations. Manages inventory, shipments, and stock movements.",
      "permissions": ["inventory:read", "inventory:receive", ...],
      "permissionsCount": 13
    },
    {
      "name": "Accountant",
      "description": "Financial operations. Handles finances, invoices, payments, approvals, and reports.",
      "permissions": ["finance:read", "invoice:create", ...],
      "permissionsCount": 13
    }
  ],
  "total": 6
}
```

### Получить список ВСЕХ ролей (системные + кастомные)

```http
GET /roles
```

**Ответ:**
```json
[
  {
    "id": "uuid-1",
    "name": "Director",
    "system": true,
    "permissions": ["users:read", "users:create", ...],
    "createdAt": "2024-01-01T00:00:00Z",
    "updatedAt": "2024-01-01T00:00:00Z"
  },
  {
    "id": "uuid-2",
    "name": "My Custom Role",
    "system": false,
    "permissions": ["orders:read", "tasks:read"],
    "createdAt": "2024-01-15T00:00:00Z",
    "updatedAt": "2024-01-15T00:00:00Z"
  }
]
```

**Поле `system`:**
- `true` - системная роль, нельзя редактировать/удалять
- `false` - кастомная роль, можно редактировать/удалять

---

## 2. Создание кастомных ролей

### Шаг 1: Получить все доступные разрешения

```http
GET /roles/permissions
```

**Ответ:**
```json
{
  "total": 87,
  "categories": [
    {
      "category": "users",
      "label": "User Management",
      "permissions": [
        "users:read",
        "users:create",
        "users:update",
        "users:delete",
        "users:force-password-reset"
      ]
    },
    {
      "category": "orders",
      "label": "Order Management",
      "permissions": [
        "orders:read",
        "orders:create",
        "orders:update",
        "orders:delete"
      ]
    },
    {
      "category": "tasks",
      "label": "Task Management",
      "permissions": [
        "tasks:read",
        "tasks:create",
        "tasks:update",
        "tasks:delete",
        "tasks:start",
        "tasks:complete",
        "tasks:pause"
      ]
    },
    {
      "category": "inventory",
      "label": "Inventory Management",
      "permissions": [
        "inventory:read",
        "inventory:write",
        "inventory:receive",
        "inventory:adjust",
        "inventory:writeoff",
        "inventory:reserve"
      ]
    }
    // ... остальные категории
  ],
  "all": [
    "users:read",
    "users:create",
    "orders:read",
    "tasks:read"
    // ... все 87 разрешений
  ]
}
```

### Шаг 2: Создать кастомную роль

```http
POST /roles
Content-Type: application/json

{
  "name": "Junior Manager",
  "permissions": [
    "orders:read",
    "orders:create",
    "tasks:read",
    "contractors:read",
    "analytics:read"
  ]
}
```

**Ответ:**
```json
{
  "id": "new-role-uuid",
  "name": "Junior Manager",
  "system": false,
  "permissions": [
    "orders:read",
    "orders:create",
    "tasks:read",
    "contractors:read",
    "analytics:read"
  ],
  "createdAt": "2024-01-20T10:30:00Z",
  "updatedAt": "2024-01-20T10:30:00Z"
}
```

**Валидация:**
- ✅ Разрешения проверяются на существование
- ❌ Если передать несуществующее разрешение `["fake:permission"]`, вернется ошибка 400

---

## 3. Редактирование кастомных ролей

### Обновить роль

```http
PATCH /roles/:id
Content-Type: application/json

{
  "name": "Senior Manager",
  "permissions": [
    "orders:read",
    "orders:create",
    "orders:update",
    "tasks:read",
    "tasks:create",
    "contractors:read",
    "contractors:update",
    "analytics:read"
  ]
}
```

**Ограничения:**
- ❌ Системные роли (`system: true`) нельзя обновлять → ошибка 400
- ✅ Можно обновить только `name` или только `permissions`

**Пример - изменить только название:**
```json
{
  "name": "New Name"
}
```

**Пример - изменить только разрешения:**
```json
{
  "permissions": ["orders:read", "tasks:read"]
}
```

---

## 4. Удаление кастомных ролей

```http
DELETE /roles/:id
```

**Ответ:**
```json
{
  "success": true
}
```

**Ограничения:**
- ❌ Системные роли нельзя удалять → ошибка 400
- ⚠️ При удалении роли, все пользователи потеряют эти разрешения (CASCADE)

---

## 5. Назначение ролей пользователям

### Назначить роли пользователю

```http
POST /roles/assign/:userId
Content-Type: application/json

{
  "roleIds": ["role-uuid-1", "role-uuid-2"]
}
```

**Ответ:**
```json
{
  "success": true
}
```

**Важно:**
- ⚠️ Это **заменяет** все текущие роли пользователя
- ✅ Можно назначить несколько ролей сразу
- ✅ Разрешения из всех ролей объединяются

**Примеры:**

```json
// Назначить только одну роль
{
  "roleIds": ["director-role-uuid"]
}

// Назначить несколько ролей (объединение разрешений)
{
  "roleIds": [
    "manager-role-uuid",
    "custom-role-uuid"
  ]
}

// Убрать все роли
{
  "roleIds": []
}
```

---

## 6. Индивидуальные разрешения (permissionsOverride)

Кроме ролей, у пользователя есть поле `permissionsOverride` - дополнительные разрешения.

### Получить пользователя с ролями

```http
GET /users/:id
```

**Ответ:**
```json
{
  "id": "user-123",
  "email": "user@example.com",
  "firstName": "John",
  "lastName": "Doe",
  "roles": [
    {
      "id": "role-1",
      "name": "Sales Manager",
      "permissions": ["orders:read", "orders:create", ...]
    }
  ],
  "permissionsOverride": ["special:permission", "custom:access"]
}
```

### Добавить индивидуальные разрешения

```http
PATCH /users/:id
Content-Type: application/json

{
  "permissionsOverride": ["analytics:read", "reports:read"]
}
```

**Как работает:**
- Разрешения пользователя = **роли** + **permissionsOverride**
- Используется для точечной настройки доступа

---

## Примеры UI для фронтенда

### 1. Выбор роли при создании пользователя

```tsx
function CreateUserForm() {
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null)
  const [customMode, setCustomMode] = useState(false)

  // Загрузить пресеты
  const { data: presets } = useFetch('/roles/system-roles')

  return (
    <div>
      <h2>Назначить роль</h2>

      {/* Вариант 1: Выбрать готовую роль */}
      <div>
        <h3>Готовые роли</h3>
        {presets?.systemRoles.map(role => (
          <Card key={role.name} onClick={() => setSelectedPreset(role.name)}>
            <h4>{role.name}</h4>
            <p>{role.description}</p>
            <Badge>{role.permissionsCount} разрешений</Badge>
          </Card>
        ))}
      </div>

      {/* Вариант 2: Создать кастомную */}
      <Button onClick={() => setCustomMode(true)}>
        Создать кастомную роль
      </Button>
    </div>
  )
}
```

### 2. Конструктор кастомной роли

```tsx
function CustomRoleBuilder() {
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([])
  const [roleName, setRoleName] = useState('')

  // Загрузить все разрешения
  const { data: permissions } = useFetch('/roles/permissions')

  const handleCreateRole = async () => {
    const response = await fetch('/roles', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: roleName,
        permissions: selectedPermissions
      })
    })

    const newRole = await response.json()
    // Теперь можно назначить эту роль пользователю
  }

  return (
    <div>
      <Input
        placeholder="Название роли"
        value={roleName}
        onChange={e => setRoleName(e.target.value)}
      />

      {/* Группировка по категориям */}
      {permissions?.categories.map(category => (
        <div key={category.category}>
          <h3>{category.label}</h3>
          {category.permissions.map(perm => (
            <Checkbox
              key={perm}
              checked={selectedPermissions.includes(perm)}
              onChange={(checked) => {
                if (checked) {
                  setSelectedPermissions([...selectedPermissions, perm])
                } else {
                  setSelectedPermissions(
                    selectedPermissions.filter(p => p !== perm)
                  )
                }
              }}
            >
              {perm}
            </Checkbox>
          ))}
        </div>
      ))}

      <Button onClick={handleCreateRole}>
        Создать роль ({selectedPermissions.length} разрешений)
      </Button>
    </div>
  )
}
```

### 3. Назначение ролей пользователю

```tsx
function AssignRolesToUser({ userId }: { userId: string }) {
  const [selectedRoleIds, setSelectedRoleIds] = useState<string[]>([])

  // Загрузить все роли (системные + кастомные)
  const { data: allRoles } = useFetch('/roles')

  const handleAssign = async () => {
    await fetch(`/roles/assign/${userId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ roleIds: selectedRoleIds })
    })
  }

  return (
    <div>
      <h3>Выберите роли для пользователя</h3>

      {allRoles?.map(role => (
        <Checkbox
          key={role.id}
          checked={selectedRoleIds.includes(role.id)}
          onChange={(checked) => {
            if (checked) {
              setSelectedRoleIds([...selectedRoleIds, role.id])
            } else {
              setSelectedRoleIds(selectedRoleIds.filter(id => id !== role.id))
            }
          }}
        >
          <div>
            <strong>{role.name}</strong>
            {role.system && <Badge>Системная</Badge>}
            <div>{role.permissions.length} разрешений</div>
          </div>
        </Checkbox>
      ))}

      <Button onClick={handleAssign}>
        Назначить ({selectedRoleIds.length} ролей)
      </Button>
    </div>
  )
}
```

### 4. Управление кастомными ролями

```tsx
function RolesManagement() {
  const { data: roles } = useFetch('/roles')

  const customRoles = roles?.filter(r => !r.system)
  const systemRoles = roles?.filter(r => r.system)

  const handleDelete = async (roleId: string) => {
    await fetch(`/roles/${roleId}`, { method: 'DELETE' })
    // Обновить список
  }

  return (
    <div>
      {/* Системные роли - только просмотр */}
      <section>
        <h2>Системные роли</h2>
        {systemRoles?.map(role => (
          <Card key={role.id}>
            <h3>{role.name}</h3>
            <p>{role.permissions.length} разрешений</p>
            <Badge>Нельзя редактировать</Badge>
          </Card>
        ))}
      </section>

      {/* Кастомные роли - можно редактировать/удалять */}
      <section>
        <h2>Кастомные роли</h2>
        {customRoles?.map(role => (
          <Card key={role.id}>
            <h3>{role.name}</h3>
            <p>{role.permissions.length} разрешений</p>
            <Button onClick={() => navigateToEdit(role.id)}>
              Редактировать
            </Button>
            <Button variant="danger" onClick={() => handleDelete(role.id)}>
              Удалить
            </Button>
          </Card>
        ))}
      </section>
    </div>
  )
}
```

---

## Формат разрешений

Все разрешения имеют формат: `{category}:{action}`

**Примеры:**
- `users:read` - Просмотр пользователей
- `users:create` - Создание пользователей
- `orders:update` - Обновление заказов
- `tasks:delete` - Удаление задач
- `inventory:receive` - Приемка товара на склад

**Категории (всего 23):**
- `users`, `roles`, `orders`, `pricing`, `quote`, `discount`
- `tasks`, `inventory`, `products`, `production`, `shipments`
- `finance`, `invoice`, `payment`, `reports`, `analytics`
- `chat`, `settings`, `audit`, `requests`, `contractors`
- `plans`, `pipeline`

---

## Проверка разрешений на фронтенде

```typescript
interface User {
  roles: Array<{ permissions: string[] }>
  permissionsOverride: string[]
}

function getUserPermissions(user: User): string[] {
  // Собрать все разрешения из ролей
  const rolePermissions = user.roles.flatMap(role => role.permissions)

  // Добавить индивидуальные разрешения
  const allPermissions = [...rolePermissions, ...user.permissionsOverride]

  // Убрать дубликаты
  return [...new Set(allPermissions)]
}

function hasPermission(user: User, permission: string): boolean {
  return getUserPermissions(user).includes(permission)
}

// Использование:
const user = getCurrentUser()

if (hasPermission(user, 'orders:create')) {
  // Показать кнопку "Создать заказ"
}

if (hasPermission(user, 'users:delete')) {
  // Показать кнопку "Удалить пользователя"
}
```

---

## Требуемые разрешения для работы с ролями

| Действие | Endpoint | Разрешение |
|----------|----------|------------|
| Просмотр ролей | `GET /roles` | `roles:read` |
| Просмотр пресетов | `GET /roles/system-roles` | `roles:read` |
| Просмотр разрешений | `GET /roles/permissions` | `roles:read` |
| Создание роли | `POST /roles` | `roles:create` |
| Обновление роли | `PATCH /roles/:id` | `roles:update` |
| Удаление роли | `DELETE /roles/:id` | `roles:delete` |
| Назначение ролей | `POST /roles/assign/:userId` | `roles:assign` |

**Кто может управлять ролями:**
- ✅ **Director** - может всё
- ❌ **Admin** - может только читать, не может создавать/редактировать/назначать
- ❌ Остальные роли - нет доступа к управлению ролями

---

## Ошибки и их обработка

### 400 Bad Request
```json
{
  "statusCode": 400,
  "message": "Cannot modify system roles"
}
```
**Причина:** Попытка редактировать/удалить системную роль

---

```json
{
  "statusCode": 400,
  "message": "Invalid permissions: fake:permission, wrong:action"
}
```
**Причина:** Указаны несуществующие разрешения

---

### 403 Forbidden
```json
{
  "statusCode": 403,
  "message": "You are not authorized to access this resource"
}
```
**Причина:** Недостаточно прав (нет нужного permission)

---

### 404 Not Found
```json
{
  "statusCode": 404,
  "message": "Role with ID xxx not found"
}
```
**Причина:** Роль с указанным ID не существует

---

### 409 Conflict
```json
{
  "statusCode": 409,
  "message": "Role with name \"Manager\" already exists"
}
```
**Причина:** Роль с таким именем уже существует

---

## Итоговый чеклист для фронтенда

**При создании пользователя:**
- [ ] Показать список готовых ролей из `GET /roles/system-roles`
- [ ] Или дать возможность создать кастомную роль
- [ ] Назначить выбранные роли через `POST /roles/assign/:userId`

**При редактировании пользователя:**
- [ ] Загрузить текущие роли из `GET /users/:id` (поле `roles`)
- [ ] Показать все доступные роли из `GET /roles`
- [ ] Дать возможность добавить/убрать роли
- [ ] Сохранить через `POST /roles/assign/:userId`

**При управлении ролями:**
- [ ] Показать системные роли (только просмотр)
- [ ] Показать кастомные роли (можно редактировать/удалять)
- [ ] Кнопка "Создать роль" → конструктор с разрешениями из `GET /roles/permissions`
- [ ] Редактирование → `PATCH /roles/:id`
- [ ] Удаление → `DELETE /roles/:id` (только для `system: false`)
