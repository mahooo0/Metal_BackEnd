# Техническое задание: Модуль "Прайси" (Price Lists)

## Общее описание

Модуль прайс-листов - справочник цен для услуг обработки металла. Расположен в разделе "Склад" бокового меню.

**Два типа прайсов:**
- Bending Prices (Прайс гнуття) - цены на гибку металла
- Cutting Prices (Прайс порізка) - цены на резку металла

**Функциональность:** Стандартный CRUD (Create, Read, Update, Delete) для обоих типов.

---

## Модели данных

### BendingPrice

```typescript
interface BendingPrice {
  id: string                    // UUID, readonly
  thickness: number             // Толщина металла (мм), required, min: 0
  coefficient: number           // Коэффициент для расчета, required, min: 0
  basePrice: number             // Базовая цена за операцию, required, min: 0
  minPrice?: number             // Минимальная цена, optional, min: 0
  description?: string          // Описание, optional, maxLength: 500
  materialItemId?: string       // UUID связанного материала, optional
  materialItem?: MaterialItem   // Связанный материал (populated), readonly
  createdAt: string             // ISO DateTime, readonly
  updatedAt: string             // ISO DateTime, readonly
}
```

### CuttingPrice

```typescript
interface CuttingPrice {
  id: string                    // UUID, readonly
  thickness: number             // Толщина металла (мм), required, min: 0
  pricePerMeter: number         // Цена за погонный метр, required, min: 0
  pricePerHour?: number         // Цена за час работы, optional, min: 0
  setupPrice?: number           // Цена настройки, optional, min: 0
  minPrice?: number             // Минимальная цена, optional, min: 0
  description?: string          // Описание, optional, maxLength: 500
  materialItemId?: string       // UUID связанного материала, optional
  materialItem?: MaterialItem   // Связанный материал (populated), readonly
  createdAt: string             // ISO DateTime, readonly
  updatedAt: string             // ISO DateTime, readonly
}
```

### MaterialItem (для селекта)

```typescript
interface MaterialItem {
  id: string
  name: string
  thickness: number
  sheetType: string
  type: {
    id: string
    name: string
  }
}
```

### Paginated Response

```typescript
interface PaginatedResponse<T> {
  data: T[]
  meta: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
}
```

---

## API Endpoints

### Bending Prices

**Base path:** `/api/price-lists/bending`

#### GET / - Получить список

Query параметры:
- `thickness?: number` - фильтр по точной толщине
- `materialItemId?: string` - фильтр по UUID материала
- `search?: string` - поиск по description (case-insensitive)
- `sortBy?: 'thickness' | 'basePrice' | 'coefficient' | 'createdAt'` - поле сортировки, default: 'thickness'
- `sortOrder?: 'asc' | 'desc'` - направление сортировки, default: 'asc'
- `page?: number` - номер страницы, default: 1, min: 1
- `limit?: number` - записей на страницу, default: 20, min: 1, max: 100

Response: `PaginatedResponse<BendingPrice>`

#### GET /:id - Получить по ID

Response: `BendingPrice`

Errors:
- 404: "Bending Price with ID {id} not found"

#### POST / - Создать

Request body:
```typescript
{
  thickness: number       // required
  coefficient: number     // required
  basePrice: number       // required
  minPrice?: number
  description?: string
  materialItemId?: string
}
```

Response: `BendingPrice` (status 201)

Errors:
- 404: "Material Item with ID {id} not found" (если указан несуществующий materialItemId)

#### PATCH /:id - Обновить

Request body (все поля optional):
```typescript
{
  thickness?: number
  coefficient?: number
  basePrice?: number
  minPrice?: number
  description?: string
  materialItemId?: string
}
```

Response: `BendingPrice`

Errors:
- 404: "Bending Price with ID {id} not found"
- 404: "Material Item with ID {id} not found"

#### DELETE /:id - Удалить

Response:
```typescript
{ message: "Bending Price deleted successfully" }
```

Errors:
- 404: "Bending Price with ID {id} not found"

---

### Cutting Prices

**Base path:** `/api/price-lists/cutting`

#### GET / - Получить список

Query параметры:
- `thickness?: number` - фильтр по точной толщине
- `materialItemId?: string` - фильтр по UUID материала
- `search?: string` - поиск по description (case-insensitive)
- `sortBy?: 'thickness' | 'pricePerMeter' | 'pricePerHour' | 'createdAt'` - поле сортировки, default: 'thickness'
- `sortOrder?: 'asc' | 'desc'` - направление сортировки, default: 'asc'
- `page?: number` - номер страницы, default: 1, min: 1
- `limit?: number` - записей на страницу, default: 20, min: 1, max: 100

Response: `PaginatedResponse<CuttingPrice>`

#### GET /:id - Получить по ID

Response: `CuttingPrice`

#### POST / - Создать

Request body:
```typescript
{
  thickness: number        // required
  pricePerMeter: number    // required
  pricePerHour?: number
  setupPrice?: number
  minPrice?: number
  description?: string
  materialItemId?: string
}
```

Response: `CuttingPrice` (status 201)

#### PATCH /:id - Обновить

Request body (все поля optional):
```typescript
{
  thickness?: number
  pricePerMeter?: number
  pricePerHour?: number
  setupPrice?: number
  minPrice?: number
  description?: string
  materialItemId?: string
}
```

Response: `CuttingPrice`

#### DELETE /:id - Удалить

Response:
```typescript
{ message: "Cutting Price deleted successfully" }
```

---

### Material Items (для селекта)

**Endpoint:** `GET /api/material-items?limit=100`

Response: `PaginatedResponse<MaterialItem>`

Формат отображения в селекте: `{name} ({thickness} мм)`

---

## Структура страниц

### Навигация

Путь в меню: Склад → Прайси

Страница содержит две вкладки (tabs):
1. "Прайс гнуття" - активная по умолчанию
2. "Прайс порізка"

URL структура:
- `/warehouse/price-lists/bending` - вкладка гибки
- `/warehouse/price-lists/cutting` - вкладка резки

### Страница списка

Элементы страницы:

1. **Header**
   - Заголовок: "Прайс гнуття" или "Прайс порізка"
   - Кнопка "Додати" (показывать только при permission `price-lists:create`)

2. **Filters панель**
   - Поле поиска (search) - placeholder: "Пошук..."
   - Селект фильтра по толщине (thickness) - placeholder: "Товщина"
   - Селект фильтра по материалу (materialItemId) - placeholder: "Матеріал"

3. **Таблица данных**

   Колонки для Bending Prices:
   - "Товщина (мм)" - поле: thickness, sortable: true
   - "Коефіцієнт" - поле: coefficient, sortable: true
   - "Базова ціна" - поле: basePrice, sortable: true, format: число + " грн"
   - "Мін. ціна" - поле: minPrice, format: число + " грн" или "-"
   - "Матеріал" - поле: materialItem?.name или "-"
   - "Дії" - кнопки: Edit (при permission `price-lists:update`), Delete (при permission `price-lists:delete`)

   Колонки для Cutting Prices:
   - "Товщина (мм)" - поле: thickness, sortable: true
   - "Ціна за метр" - поле: pricePerMeter, sortable: true, format: число + " грн"
   - "Ціна за годину" - поле: pricePerHour, sortable: true, format: число + " грн" или "-"
   - "Налаштування" - поле: setupPrice, format: число + " грн" или "-"
   - "Мін. ціна" - поле: minPrice, format: число + " грн" или "-"
   - "Матеріал" - поле: materialItem?.name или "-"
   - "Дії" - кнопки: Edit, Delete

4. **Pagination**
   - Показывать: номера страниц, кнопки prev/next
   - Текст: "Показано {from}-{to} з {total}"

### Модальное окно создания/редактирования

**Заголовок:**
- Создание: "Додати прайс гнуття" / "Додати прайс порізка"
- Редактирование: "Редагувати прайс гнуття" / "Редагувати прайс порізка"

**Поля формы для Bending Price:**

1. thickness (number input)
   - Label: "Товщина (мм)"
   - Required: true
   - Validation: min 0
   - Error message: "Введіть товщину"

2. coefficient (number input)
   - Label: "Коефіцієнт"
   - Required: true
   - Validation: min 0
   - Error message: "Введіть коефіцієнт"

3. basePrice (number input)
   - Label: "Базова ціна"
   - Required: true
   - Validation: min 0
   - Error message: "Введіть базову ціну"

4. minPrice (number input)
   - Label: "Мінімальна ціна"
   - Required: false
   - Validation: min 0

5. materialItemId (select)
   - Label: "Матеріал"
   - Required: false
   - Placeholder: "Оберіть матеріал..."
   - Options: загрузить из GET /material-items

6. description (textarea)
   - Label: "Опис"
   - Required: false
   - Validation: maxLength 500

**Поля формы для Cutting Price:**

1. thickness (number input)
   - Label: "Товщина (мм)"
   - Required: true

2. pricePerMeter (number input)
   - Label: "Ціна за метр"
   - Required: true

3. pricePerHour (number input)
   - Label: "Ціна за годину"
   - Required: false

4. setupPrice (number input)
   - Label: "Ціна налаштування"
   - Required: false

5. minPrice (number input)
   - Label: "Мінімальна ціна"
   - Required: false

6. materialItemId (select)
   - Label: "Матеріал"
   - Required: false

7. description (textarea)
   - Label: "Опис"
   - Required: false

**Кнопки:**
- "Скасувати" - закрыть модальное окно без сохранения
- "Зберегти" - отправить форму

### Диалог подтверждения удаления

- Заголовок: "Видалити прайс?"
- Текст: "Ви впевнені, що хочете видалити прайс для товщини {thickness} мм?"
- Подтекст: "Цю дію неможливо скасувати."
- Кнопки: "Скасувати", "Видалити" (danger style)

---

## Права доступа (Permissions)

```typescript
enum PriceListPermissions {
  READ = 'price-lists:read',
  CREATE = 'price-lists:create',
  UPDATE = 'price-lists:update',
  DELETE = 'price-lists:delete'
}
```

Условия отображения UI элементов:
- Страница доступна: требуется `price-lists:read`
- Кнопка "Додати": требуется `price-lists:create`
- Кнопка редактирования в таблице: требуется `price-lists:update`
- Кнопка удаления в таблице: требуется `price-lists:delete`

---

## Обработка состояний

### Loading

- При загрузке списка: показать skeleton таблицы
- При отправке формы: показать spinner на кнопке "Зберегти", заблокировать форму
- При удалении: показать spinner на кнопке "Видалити"

### Empty states

- Пустой список: "Прайси відсутні. Додайте перший прайс." + кнопка "Додати"
- Нет результатов поиска/фильтрации: "За вашим запитом нічого не знайдено"

### Error handling

HTTP коды и сообщения:
- 400: показать ошибки валидации под соответствующими полями формы
- 403: toast "Недостатньо прав доступу"
- 404: toast с сообщением из response.message
- 500: toast "Помилка сервера. Спробуйте пізніше."

### Success notifications (toast)

- После создания: "Прайс успішно створено"
- После обновления: "Прайс успішно оновлено"
- После удаления: "Прайс успішно видалено"

---

## UX требования

1. **Поиск**: debounce 300ms перед отправкой запроса
2. **Фильтры**: сохранять в URL query параметрах для возможности поделиться ссылкой
3. **Модальные окна**: закрывать по нажатию Escape
4. **Формы**: автофокус на первое поле при открытии
5. **Таблица**: при клике на заголовок колонки менять сортировку (asc → desc → asc)

---

## Примеры запросов

### Создание Bending Price

```http
POST /api/price-lists/bending
Content-Type: application/json

{
  "thickness": 2.0,
  "coefficient": 1.5,
  "basePrice": 100,
  "minPrice": 50,
  "description": "Стандартна ціна для 2мм сталі"
}
```

### Получение списка с фильтрами

```http
GET /api/price-lists/bending?thickness=2&sortBy=basePrice&sortOrder=desc&page=1&limit=20
```

### Обновление Cutting Price

```http
PATCH /api/price-lists/cutting/550e8400-e29b-41d4-a716-446655440000
Content-Type: application/json

{
  "pricePerMeter": 55,
  "pricePerHour": 1100
}
```

---

## Файловая структура (рекомендация)

```
src/
├── pages/
│   └── warehouse/
│       └── price-lists/
│           ├── index.tsx                    # Страница с табами
│           ├── components/
│           │   ├── BendingPricesTab.tsx     # Вкладка гибки
│           │   ├── CuttingPricesTab.tsx     # Вкладка резки
│           │   ├── PriceListTable.tsx       # Переиспользуемая таблица
│           │   ├── BendingPriceForm.tsx     # Форма для гибки
│           │   ├── CuttingPriceForm.tsx     # Форма для резки
│           │   └── DeleteConfirmDialog.tsx  # Диалог удаления
│           └── hooks/
│               ├── useBendingPrices.ts      # API хук для гибки
│               └── useCuttingPrices.ts      # API хук для резки
├── api/
│   └── price-lists.ts                       # API функции
└── types/
    └── price-lists.ts                       # TypeScript типы
```
