# Setup

- Make sure that you already have DB running from `pf-db` project.
- Make `.env` from `.env.example` (fillin the password)
- Make `.npmrc` from `.npmrc.example` (adjust your shell accordingly)
- `pnpm install`
- `pnpm run dev`
- `pnpm install cloudinary`
- `pnpm install multer`
- `pnpm add -D @types/multer`

# Setup from scratch

- See https://cmu.to/fullstack68

# Containerization and test

- Make `.env.test` from `.env.test.example`
- `docker compose --env-file ./.env.test up -d --force-recreate --build`

# Push to dockerhub

- `docker tag preflight-backend [DOCKERHUB_ACCOUNT]/preflight-backend:latest`
- `docker push [DOCKERHUB_ACCOUNT]/preflight-backend:latest`

# API Spece
-`/login → เข้าสู่ระบบ (สำเร็จ, ขาดข้อมูล, รหัสผิด/ไม่พบ)`\

-`/buy → ซื้อสินค้า (สำเร็จ, ขาดข้อมูล, ไม่พบผู้ซื้อ/สินค้า, ซื้อของตัวเอง)`\

-`/sell (POST) → ลงขาย (สำเร็จ, ขาดข้อมูล, ไม่มีรูป, ผิดพลาด)`\

-`/sell (PATCH) → แก้ไข (สำเร็จ, ขาดข้อมูล, ไม่ใช่เจ้าของ, วันที่ไม่ถูกต้อง)`\

-`/sell (DELETE) → ลบสินค้า (สำเร็จ, ขาดข้อมูล, ไม่ใช่เจ้าของ)`\

-`/items → ดูสินค้าทั้งหมด (สำเร็จ, ผิดพลาด)`\

-`/kill/user → ลบผู้ใช้ (สำเร็จ, ขาดข้อมูล, secret ไม่ตรง, ไม่พบ)`\
