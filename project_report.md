# BÁO CÁO CHI TIẾT DỰ ÁN RENTHUB - HỆ THỐNG KẾT NỐI CHO THUÊ BẤT ĐỘNG SẢN

Báo cáo này cung cấp cái nhìn toàn diện về kiến trúc công nghệ, mô hình dữ liệu và các luồng logic nghiệp vụ chính của hệ thống RentHub.

---

## 1. Tổng Quan Dự Án
**RentHub** là một nền tảng Web cho phép người dùng đăng tin cho thuê và tìm kiếm các loại bất động sản (phòng trọ, căn hộ, chung cư, nhà nguyên căn). Hệ thống bao gồm hai giao diện chính:
*   **User Portal:** Dành cho người tìm kiếm và người cho thuê (đăng bài, cập nhật trạng thái, chỉnh sửa và quản lý tin đăng của mình).
*   **Admin Dashboard:** Dành cho quản trị viên theo dõi số liệu thống kê (doanh thu, cơ cấu tin đăng) và xử lý báo cáo vi phạm tin đăng từ phía người dùng.

---

## 2. Danh Sách Công Nghệ Sử Dụng (Technology Stack)

### Giao Diện (Frontend)
*   **Framework chính:** React 18+ (sử dụng [Vite](file:///d:/Web%20Landing%20Page%20Design/vite.config.ts) để build & chạy dự án cực nhanh).
*   **Ngôn ngữ:** TypeScript (đảm bảo kiểm soát kiểu chặt chẽ, giảm thiểu lỗi runtime).
*   **Định tuyến (Routing):** [React Router v7](file:///d:/Web%20Landing%20Page%20Design/src/app/routes.tsx) (`createBrowserRouter`), hỗ trợ điều hướng mượt mà không load lại trang.
*   **Quản lý trạng thái (State Management):** [AuthContext](file:///d:/Web%20Landing%20Page%20Design/src/app/context/AuthContext.tsx) (React Context API) quản lý trạng thái đăng nhập toàn cục.
*   **Giao diện và Styling:**
    *   **Tailwind CSS v4:** Công cụ styling chính cho tốc độ phát triển giao diện nhanh.
    *   **Radix UI / Shadcn UI Primitives:** Các component UI nền tảng như Dialog, Accordion, Dropdown,...
    *   **Lucide React:** Bộ icon SVG tối giản và hiện đại.
    *   **Recharts:** Vẽ biểu đồ trực quan hóa dữ liệu thống kê trên Admin Dashboard.

### Máy Chủ (Backend)
*   **Runtime:** Node.js.
*   **Framework:** [Express.js](file:///d:/Web%20Landing%20Page%20Design/backend/src/app.js) - xây dựng RESTful API linh hoạt và nhẹ nhàng.
*   **Xác thực bảo mật:**
    *   `jsonwebtoken` (JWT): Tạo và xác minh mã token truy cập cho các request được bảo vệ.
    *   `bcryptjs`: Mã hóa một chiều mật khẩu người dùng trước khi lưu vào cơ sở dữ liệu.
*   **Xử lý File & Media:**
    *   `multer` & `multer-storage-cloudinary`: Middleware nhận diện tập tin upload từ client và chuyển trực tiếp tới Cloud Storage.

### Cơ Sở Dữ Liệu & Dịch Vụ Lưu Trữ (Database & Storage)
*   **Hệ quản trị CSDL:** Microsoft SQL Server (MSSQL), kết nối qua thư viện `mssql` của Node.js với cơ chế Parameterized Query để ngăn chặn tấn công SQL Injection.
*   **Lưu trữ đám mây:** Cloudinary - Lưu trữ hình ảnh và video chất lượng cao với CDN tối ưu hóa tốc độ tải.

---

## 3. Kiến Trúc Cơ Sở Dữ Liệu (Database Schema)

Dựa trên cấu trúc truy vấn trong backend, cơ sở dữ liệu **RentHubDB** được thiết lập với 6 bảng chính sau:

```mermaid
erDiagram
    Users ||--o{ Properties : "owns"
    Users ||--o{ Reports : "reports"
    Properties ||--o{ Images : "has"
    Properties ||--o{ PropertyFeatures : "contains"
    Properties ||--o{ Reports : "is_reported"
    Payments }o--|| Users : "made_by"

    Users {
        int id PK
        nvarchar username
        nvarchar password
        nvarchar email
        nvarchar phone
        nvarchar role "USER | ADMIN"
        bit is_active
    }
    Properties {
        int id PK
        int owner_id FK
        nvarchar title
        nvarchar description
        decimal price
        float area
        nvarchar address
        nvarchar city
        nvarchar district
        nvarchar property_type "apartment | house | room | condo"
        nvarchar video_url
        nvarchar status "ACTIVE | BANNED | INACTIVE"
        datetime created_at
    }
    Images {
        int id PK
        int property_id FK
        nvarchar url
    }
    PropertyFeatures {
        int property_id PK,FK
        nvarchar feature_id PK
    }
    Reports {
        int id PK
        int reporter_id FK
        int property_id FK
        nvarchar reason
        nvarchar status "PENDING | RESOLVED_BANNED | DISMISSED"
        datetime created_at
    }
    Payments {
        int id PK
        decimal amount
        nvarchar status "COMPLETED"
        datetime created_at
    }
```

---

## 4. Các Luồng Logic Nghiệp Vụ Chính (Core Logical Flows)

### 4.1. Đăng ký & Đăng nhập (Authentication Flow)

Luồng xác thực của hệ thống sử dụng cơ chế Token-based Authentication qua JWT.

```mermaid
sequenceDiagram
    autonumber
    actor User as Người dùng
    participant FE as Frontend React
    participant BE as Backend Express
    participant DB as SQL Server

    User->>FE: Điền thông tin Đăng nhập (Username/Email & Password)
    FE->>BE: POST /api/auth/login
    BE->>DB: SELECT * FROM Users WHERE username = ?
    DB-->>BE: Trả về thông tin User (bao gồm mật khẩu đã băm)
    Note over BE: Kiểm tra trạng thái is_active
    Note over BE: bcrypt.compare(password, user.password)
    alt Khớp thông tin
        BE->>BE: Tạo JWT token chứa (id, username, role)
        BE-->>FE: Trả về { success: true, token, user }
        FE->>FE: Lưu token & user vào localStorage
        FE->>FE: Cập nhật AuthContext state
        FE->>User: Chuyển hướng sang Trang chủ / Dashboard
    else Sai mật khẩu / Tài khoản bị khóa
        BE-->>FE: Trả về lỗi 401/403
        FE->>User: Hiển thị thông báo lỗi
    end
```

---

### 4.2. Đăng tin & Tải ảnh lên (Post Property & Upload Flow)

Quá trình đăng một bất động sản mới bao gồm hai giai đoạn liên tiếp: tải ảnh lên Cloudinary để lấy link ảnh CDN, sau đó gửi tất cả dữ liệu text + link ảnh về Server để thực hiện lưu trữ dạng Transaction.

```mermaid
sequenceDiagram
    autonumber
    actor User as Chủ nhà
    participant FE as Frontend React
    participant BE as Backend Express
    participant Cloud as Cloudinary Storage
    participant DB as SQL Server

    User->>FE: Chọn ảnh bất động sản và nhập thông tin bài viết
    FE->>FE: Đóng gói các file ảnh vào FormData
    FE->>BE: POST /api/upload (đính kèm JWT Header)
    Note over BE: authMiddleware kiểm tra JWT token hợp lệ
    BE->>Cloud: Tải các tập tin ảnh lên Cloudinary qua multer-storage-cloudinary
    Cloud-->>BE: Trả về danh sách Cloudinary Image URLs
    BE-->>FE: HTTP 200 { success: true, urls }
    FE->>FE: Tổng hợp toàn bộ dữ liệu (title, price,..., images: urls)
    FE->>BE: POST /api/properties (đính kèm JSON body + JWT Header)
    BE->>BE: Khởi động SQL Transaction
    BE->>DB: INSERT INTO Properties -> lấy ID mới
    BE->>DB: Vòng lặp INSERT các URL vào bảng Images
    BE->>DB: Vòng lặp INSERT các tiện ích vào bảng PropertyFeatures
    alt Lưu DB thành công
        BE->>BE: Commit Transaction
        BE-->>FE: HTTP 201 { success: true, message: "Tạo bài đăng thành công" }
        FE->>User: Thông báo thành công & Chuyển hướng về Dashboard
    else Lỗi xảy ra (DB Error)
        BE->>BE: Rollback Transaction (Hủy toàn bộ thay đổi tạm thời)
        BE-->>FE: HTTP 500 { message: "Lỗi tạo bài đăng" }
        FE->>User: Hiển thị lỗi hệ thống
    end
```

---

### 4.3. Tìm kiếm & Lọc (Search & Filter Flow)

Khách truy cập có thể tìm kiếm bất động sản theo Địa điểm, Loại hình và khoảng Giá. Luồng xử lý ở backend được tối ưu hóa để tránh lỗi truy vấn $N+1$ khi tải danh sách ảnh đi kèm.

1.  **Frontend gửi truy vấn:** Client gửi yêu cầu dạng `GET /api/properties?city=...&property_type=...&minPrice=...&maxPrice=...`.
2.  **Backend tạo Query động:**
    *   Tạo đối tượng `mssql.Request()`.
    *   Xây dựng chuỗi truy vấn động: Thêm các điều kiện `AND p.price >= @minPrice`, `AND p.property_type = @property_type` một cách an toàn thông qua biến truyền vào.
3.  **Tải ảnh tối ưu (Tránh N+1 Query):**
    *   Sau khi có danh sách Properties, backend gọi `SELECT property_id, url FROM Images` để lấy toàn bộ dữ liệu hình ảnh hiện có.
    *   Thực hiện gom nhóm (Group) danh sách hình ảnh theo `property_id` thành một Map dạng bộ nhớ đệm trong JS.
    *   Duyệt qua danh sách bất động sản và gán mảng ảnh tương ứng từ Map trước khi trả về.
4.  **Hiển thị:** Trả dữ liệu JSON về cho Frontend hiển thị danh sách bài đăng nổi bật dạng Grid.

---

### 4.4. Quản trị viên xử lý báo cáo vi phạm (Admin Moderation Flow)

Khi một tin đăng bị báo cáo vi phạm, luồng xử lý kiểm duyệt hoạt động như sau:

```mermaid
flowchart TD
    A[Người dùng phát hiện vi phạm] -->|Gửi lý do báo cáo| B(POST /api/reports)
    B -->|Lưu CSDL với status = PENDING| C[(Bảng Reports)]
    D[Admin truy cập Admin Dashboard] -->|Yêu cầu danh sách báo cáo| E(GET /api/admin/reports)
    E -->|Truy vấn Reports & Properties| C
    E -->|Hiển thị danh sách duyệt| F[Giao diện Admin]
    F -->|Admin click Ban/Dismiss| G(PUT /api/admin/reports/:id)
    G -->|Bắt đầu Transaction| H{Lựa chọn hành động}
    H -->|ban| I[Update status Report = RESOLVED_BANNED]
    I --> J[Update status Property = BANNED]
    H -->|dismiss| K[Update status Report = DISMISSED]
    J --> L[Commit Transaction]
    K --> L
    L -->|Trả kết quả| M[Frontend cập nhật giao diện Admin & ẩn tin vi phạm khỏi trang chủ]
```

---

## 5. Nhận Xét & Định Hướng Hoàn Thiện

### Ưu Điểm Hiện Tại
1.  **Bảo mật truy vấn:** Tất cả các endpoint trong controllers đều dùng **Parameterized Query** hoặc Transaction của gói `mssql`, giảm thiểu tối đa rủi ro tấn công **SQL Injection**.
2.  **Quản lý Media tốt:** Nhờ tích hợp trực tiếp `Cloudinary Storage` nên máy chủ Node.js không cần lưu trữ file vật lý trên đĩa cứng, giúp triển khai lên Cloud (Render, Heroku, AWS) rất dễ dàng.
3.  **Routing rõ ràng:** Sử dụng `ProtectedRoute` bọc ngoài các component để lọc quyền truy cập trực tiếp ngay ở client, nâng cao trải nghiệm UI.

### Hướng Phát Triển Tiếp Theo (Để Dự Án Đạt Chất Lượng Premium)
*   **Thêm luồng thanh toán thực tế:** Hoàn thiện bảng `Payments` kết hợp với cổng ví điện tử (Momo, VNPAY) hoặc Stripe để người dùng trả phí dịch vụ tin đăng nổi bật.
*   **Hệ thống chat trực tiếp:** Tích hợp `Socket.io` để người thuê có thể liên hệ và thương lượng giá cả trực tiếp với chủ nhà thông qua giao diện RentHub.
*   **Google Maps API:** Tích hợp bản đồ trực quan để người dùng tìm phòng trọ xung quanh vị trí của họ dễ dàng hơn.
*   **Xác thực nâng cao:** Bổ sung gửi mã OTP khi đăng ký hoặc thay đổi thông tin nhạy cảm.
