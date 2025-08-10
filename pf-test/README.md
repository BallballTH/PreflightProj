```
npm init es6

pnpm install cypress typescript dotenv @tsconfig/node-lts @tsconfig/node-ts
@types/node

npx cypress install 

pnpm add form-data node-fetch@2 -D 

pnpm add @types/form-data @types/node-fetch@2 -D 

npm run test
```

-GET /items: 200 และรูปแบบเป็น array

-POST /register: สมัครสำเร็จ, ซ้ำ → 409

-POST /login: user ผิด/รหัสผิด → 401, สำเร็จ (uuid ตรง)

-POST /sell: ส่ง JSON แทน multipart → 400/415, multipart ไม่มีไฟล์ → 400, multipart มีไฟล์ → 201

-PATCH /sell: ไม่ใช่เจ้าของ → 403, ขาดฟิลด์ → 400, วันที่ไม่ถูกต้อง → 400, อัปเดตสำเร็จและตรวจสอบด้วย GET

-PATCH /buy: ขาดฟิลด์ → 400, ไม่พบบุคคล → 404, ไม่พบสินค้า → 404, ซื้อของตัวเอง → 403, ซื้อสำเร็จและตรวจ flags
-DELETE /sell: ลบสำเร็จ (ยอมรับ 200/204) และ chain ตรวจด้วย GET
