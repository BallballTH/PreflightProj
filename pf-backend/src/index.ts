import "dotenv/config";
import { dbClient } from "@db/client.js";
import { user, item } from "@db/schema.js";
import cors from "cors";
import Debug from "debug";
import { eq, and } from "drizzle-orm";
import type { ErrorRequestHandler, Request, Response, NextFunction } from "express";
import express from "express";
import helmet from "helmet";
import morgan from "morgan";
import crypto from "crypto";
import bcrypt from "bcrypt";

const debug = Debug("pf-backend");
const app = express();

// Middleware
app.use(morgan("dev"));
app.use(helmet());
app.use(cors({ origin: process.env.CORS_ORIGIN?.split(',') || false }));
app.use(express.json());

// Helper to catch async errors
const catchAsync = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch((err) => next(err));
  };

/* ----------------------------
   register user
----------------------------- */
app.post("/register", catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'fail', message: 'Username and password are required' });
  }

  const existing = await dbClient.query.user.findFirst({ where: eq(user.name, username) });
  if (existing) {
    return res.status(409).json({ status: 'fail', message: 'Username already exists' });
  }

  const uid = crypto.randomUUID();
  const hashed = await bcrypt.hash(password, 12);
  const result = await dbClient.insert(user).values({
    uid,
    name: username,
    hashedpassword: hashed,
    createdAt: new Date(),
    updatedAt: new Date(),
  }).returning({ uid: user.uid });

  res.status(201).json({ status: 'success', msg: 'Register success', uuid: result[0].uid });
}));

/* ----------------------------
   login
----------------------------- */
app.post("/login", catchAsync(async (req: Request, res: Response) => {
  const { username, password } = req.body;
  if (!username || !password) {
    return res.status(400).json({ status: 'fail', message: 'Username and password are required' });
  }

  const found = await dbClient.query.user.findFirst({ where: eq(user.name, username) });
  if (!found) {
    return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
  }

  const match = await bcrypt.compare(password, found.hashedpassword);
  if (!match) {
    return res.status(401).json({ status: 'fail', message: 'Invalid credentials' });
  }

  res.json( {uuid : found.uid} );
}));

/* ----------------------------
   buy item
----------------------------- */
app.patch("/buy", catchAsync(async (req: Request, res: Response) => {
  const { uuid, item_id } = req.body;
  if (!uuid || item_id === undefined) {
    return res.status(400).json({ status: 'fail', message: 'User UUID and item_id are required' });
  }
  //ensure buyer exists
  const buyer = await dbClient.query.user.findFirst({ where: eq(user.uid, uuid) });
  if (!buyer) {
    return res.status(404).json({ status: 'fail', message: 'Buyer not found' });
  }
  //ensure item exists
  const target = await dbClient.query.item.findFirst({ where: eq(item.id, item_id) });
  if (!target) {
    return res.status(404).json({ status: 'fail', message: 'Item not found' });
  }
  //prevent buying own item
  if (target.seller === uuid) {
    return res.status(403).json({ status: 'fail', message: 'You cannot buy your own item' });
  }
  //(optional hardening) prevent double purchase / inactive
  if (target.is_purchased || !target.is_active) {
    return res.status(409).json({ status: 'fail', message: 'Item is not available for purchase' });
  }

  const updated = await dbClient.update(item).set({
    customer: uuid,
    is_purchased: true,
    is_active: false,
    status: 0,
    updatedAt: new Date(),
  }).where(eq(item.id, item_id)).returning();

  res.json({ status: 'success', msg: 'Item purchased', data: updated });
}));

/* ----------------------------
   create item for sale
----------------------------- */
app.post("/sell", catchAsync(async (req: Request, res: Response) => {
  const { name, detail, image, status, seller, date } = req.body;
  if (!name || !detail || !seller || !date) {
    return res.status(400).json({ status: 'fail', message: 'Name, detail, seller and date are required' });
  }

  const createdAt = new Date(date);
  if (isNaN(createdAt.getTime())) {
    return res.status(400).json({ status: 'fail', message: 'Invalid date format' });
  }

  const result = await dbClient.insert(item).values({
    name,
    detail,
    image,
    status,
    seller,
    customer: null,
    is_purchased: false,
    is_active: true,
    createdAt,
    updatedAt: createdAt,
  }).returning({ id: item.id });

  res.status(201).json({ status: 'success', msg: 'Item created', id: result[0].id });
}));

/* ----------------------------
   item update
----------------------------- */
app.patch("/sell", catchAsync(async (req: Request, res: Response) => {
  const { item_id, name, detail, image, status, seller, date } = req.body;
  if (!item_id || !seller || !date) {
    return res.status(400).json({ status: 'fail', message: 'item_id, seller and date are required' });
  }

  const existing = await dbClient.query.item.findFirst({ where: and(eq(item.id, item_id), eq(item.seller, seller)) });
  if (!existing) {
    return res.status(403).json({ status: 'fail', message: 'Not authorized to edit this item' });
  }

  const updatedAt = new Date(date);
  if (isNaN(updatedAt.getTime())) {
    return res.status(400).json({ status: 'fail', message: 'Invalid date format' });
  }

  const updated = await dbClient.update(item).set({
    name: name ?? existing.name,
    detail: detail ?? existing.detail,
    image: image ?? existing.image,
    status: status ?? existing.status,
    updatedAt,
  }).where(eq(item.id, item_id)).returning();

  res.json({ status: 'success', msg: 'Item updated', data: updated });
}));

/* ----------------------------
   delete item
----------------------------- */
app.delete("/sell", catchAsync(async (req: Request, res: Response) => {
  const { uuid, item_id } = req.body;
  if (!uuid || !item_id) {
    return res.status(400).json({ status: 'fail', message: 'uuid and item_id are required' });
  }

  const existing = await dbClient.query.item.findFirst({ where: and(eq(item.id, item_id), eq(item.seller, uuid)) });
  if (!existing) {
    return res.status(403).json({ status: 'fail', message: 'Not authorized to delete this item' });
  }

  await dbClient.delete(item).where(eq(item.id, item_id));
  res.json({ status: 'success', msg: 'Item deleted', id: item_id });
}));

/* ----------------------------
   query all items
----------------------------- */
app.get("/", catchAsync(async (_req: Request, res: Response) => {
  const items = await dbClient.query.item.findMany();
  res.json(items );
}));



/* ----------------------------
   Global Error Handler
----------------------------- */
const globalErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  debug(err.stack || err.message);
  res.status(500).json({ status: 'error', message: 'Internal Server Error' });
};
app.use(globalErrorHandler);

/* ----------------------------
   Start Server
----------------------------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  debug(`Listening on http://localhost:${PORT}`);
});
