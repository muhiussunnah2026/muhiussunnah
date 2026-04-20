"use server";

import { z } from "zod";
import { revalidatePath } from "next/cache";
import { authorizeAction, fail, ok } from "./_helpers";
import { supabaseServer } from "@/lib/supabase/server";
import type { ActionResult } from "./_helpers";

// ─── Library ──────────────────────────────────────────────────────────────────

const addBookSchema = z.object({
  schoolSlug: z.string(),
  title: z.string().min(1, "শিরোনাম দিন"),
  author: z.string().optional(),
  isbn: z.string().optional(),
  category: z.string().optional(),
  publisher: z.string().optional(),
  language: z.string().default("bn"),
  copies_total: z.coerce.number().int().min(1).default(1),
  shelf: z.string().optional(),
  price: z.coerce.number().min(0).optional(),
});

export async function addBookAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addBookSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "library" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("library_books").insert({
    school_id: auth.active.school_id,
    title: data.title,
    author: data.author || null,
    isbn: data.isbn || null,
    category: data.category || null,
    publisher: data.publisher || null,
    language: data.language,
    copies_total: data.copies_total,
    copies_available: data.copies_total,
    shelf: data.shelf || null,
    price: data.price ?? null,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/library`);
  return ok(null, "বই যোগ হয়েছে।");
}

const issueBookSchema = z.object({
  schoolSlug: z.string(),
  book_id: z.string().uuid(),
  student_id: z.string().uuid(),
  due_on: z.string().min(1, "ফেরতের তারিখ দিন"),
  notes: z.string().optional(),
});

export async function issueBookAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = issueBookSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "library" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: issueErr } = await (supabase as any).from("library_issues").insert({
    book_id: data.book_id,
    student_id: data.student_id,
    due_on: data.due_on,
    notes: data.notes || null,
    issued_by: auth.active.school_user_id,
  });
  if (issueErr) return fail(issueErr.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("decrement_book_copies", { p_book_id: data.book_id }).maybeSingle();

  revalidatePath(`/admin/library`);
  return ok(null, "বই ইস্যু হয়েছে।");
}

export async function returnBookAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const issueId = formData.get("issue_id") as string;
  const bookId = formData.get("book_id") as string;
  const schoolSlug = formData.get("schoolSlug") as string;
  const fine = Number(formData.get("fine") ?? 0);

  if (!issueId || !bookId || !schoolSlug) return fail("Invalid data");

  const auth = await authorizeAction({ schoolSlug, action: "update", resource: "library" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from("library_issues")
    .update({ returned_on: new Date().toISOString().split("T")[0], fine })
    .eq("id", issueId);
  if (error) return fail(error.message);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any).rpc("increment_book_copies", { p_book_id: bookId }).maybeSingle();

  revalidatePath(`/admin/library`);
  return ok(null, "বই ফেরত নেওয়া হয়েছে।");
}

// ─── Transport ────────────────────────────────────────────────────────────────

const addRouteSchema = z.object({
  schoolSlug: z.string(),
  name: z.string().min(1, "রুটের নাম দিন"),
  start_point: z.string().optional(),
  end_point: z.string().optional(),
  fare_per_month: z.coerce.number().min(0).optional(),
});

export async function addTransportRouteAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addRouteSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "transport" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("transport_routes").insert({
    school_id: auth.active.school_id,
    name: data.name,
    start_point: data.start_point || null,
    end_point: data.end_point || null,
    fare_per_month: data.fare_per_month ?? null,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/transport`);
  return ok(null, "রুট যোগ হয়েছে।");
}

const addVehicleSchema = z.object({
  schoolSlug: z.string(),
  route_id: z.string().uuid(),
  reg_no: z.string().min(1, "রেজিস্ট্রেশন নম্বর দিন"),
  driver_name: z.string().optional(),
  driver_phone: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
});

export async function addVehicleAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addVehicleSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "transport" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("transport_vehicles").insert({
    route_id: data.route_id,
    reg_no: data.reg_no,
    driver_name: data.driver_name || null,
    driver_phone: data.driver_phone || null,
    capacity: data.capacity ?? null,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/transport`);
  return ok(null, "গাড়ি যোগ হয়েছে।");
}

export async function assignStudentToRouteAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  const route_id = formData.get("route_id") as string;
  const student_id = formData.get("student_id") as string;
  const pickup_stop = formData.get("pickup_stop") as string | null;

  if (!schoolSlug || !route_id || !student_id) return fail("Invalid data");

  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "transport" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("transport_students").upsert(
    { student_id, route_id, pickup_stop: pickup_stop || null, is_active: true },
    { onConflict: "student_id" },
  );

  if (error) return fail(error.message);
  revalidatePath(`/admin/transport`);
  return ok(null, "ছাত্র রুটে যোগ হয়েছে।");
}

// ─── Hostel ───────────────────────────────────────────────────────────────────

const addHostelSchema = z.object({
  schoolSlug: z.string(),
  name: z.string().min(1, "হোস্টেলের নাম দিন"),
  type: z.enum(["boys", "girls", "mixed"]).default("boys"),
  warden_name: z.string().optional(),
  warden_phone: z.string().optional(),
  capacity: z.coerce.number().int().min(1).optional(),
});

export async function addHostelAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addHostelSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "hostel" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("hostels").insert({
    school_id: auth.active.school_id,
    name: data.name,
    type: data.type,
    warden_name: data.warden_name || null,
    warden_phone: data.warden_phone || null,
    capacity: data.capacity ?? null,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/hostel`);
  return ok(null, "হোস্টেল যোগ হয়েছে।");
}

const addRoomSchema = z.object({
  schoolSlug: z.string(),
  hostel_id: z.string().uuid(),
  room_no: z.string().min(1, "রুম নম্বর দিন"),
  capacity: z.coerce.number().int().min(1).default(1),
});

export async function addRoomAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addRoomSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "hostel" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("hostel_rooms").insert({
    hostel_id: data.hostel_id,
    room_no: data.room_no,
    capacity: data.capacity,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/hostel`);
  return ok(null, "রুম যোগ হয়েছে।");
}

export async function allocateHostelAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const schoolSlug = formData.get("schoolSlug") as string;
  const room_id = formData.get("room_id") as string;
  const student_id = formData.get("student_id") as string;
  const bed_no = formData.get("bed_no") as string | null;
  const from_date = formData.get("from_date") as string;

  if (!schoolSlug || !room_id || !student_id || !from_date) return fail("Invalid data");

  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "hostel" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("hostel_allocations").insert({
    room_id,
    student_id,
    from_date,
    bed_no: bed_no || null,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/hostel`);
  return ok(null, "ছাত্র হোস্টেলে বরাদ্দ হয়েছে।");
}

// ─── Inventory ────────────────────────────────────────────────────────────────

const addItemSchema = z.object({
  schoolSlug: z.string(),
  name: z.string().min(1, "আইটেমের নাম দিন"),
  category: z.string().optional(),
  unit: z.string().optional(),
  reorder_level: z.coerce.number().min(0).optional(),
  unit_price: z.coerce.number().min(0).optional(),
  supplier: z.string().optional(),
});

export async function addInventoryItemAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = addItemSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "inventory" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from("inventory_items").insert({
    school_id: auth.active.school_id,
    name: data.name,
    category: data.category || null,
    unit: data.unit || null,
    reorder_level: data.reorder_level ?? null,
    unit_price: data.unit_price ?? null,
    supplier: data.supplier || null,
    stock: 0,
  });

  if (error) return fail(error.message);
  revalidatePath(`/admin/inventory`);
  return ok(null, "আইটেম যোগ হয়েছে।");
}

const movementSchema = z.object({
  schoolSlug: z.string(),
  item_id: z.string().uuid(),
  type: z.enum(["in", "out", "adjustment", "waste", "transfer"]),
  qty: z.coerce.number().positive("পরিমাণ দিন"),
  reference: z.string().optional(),
  date: z.string().min(1),
  notes: z.string().optional(),
});

export async function addInventoryMovementAction(
  _prev: ActionResult<unknown> | null,
  formData: FormData,
): Promise<ActionResult<unknown>> {
  const raw = Object.fromEntries(formData);
  const parsed = movementSchema.safeParse(raw);
  if (!parsed.success) return fail(parsed.error.issues[0].message);

  const { schoolSlug, ...data } = parsed.data;
  const auth = await authorizeAction({ schoolSlug, action: "create", resource: "inventory" });
  if ("error" in auth) return auth.error as ActionResult<unknown>;

  const supabase = await supabaseServer();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error: mvErr } = await (supabase as any).from("inventory_movements").insert({
    item_id: data.item_id,
    type: data.type,
    qty: data.qty,
    reference: data.reference || null,
    date: data.date,
    by_user: auth.active.school_user_id,
    notes: data.notes || null,
  });
  if (mvErr) return fail(mvErr.message);

  // Update stock
  const delta = data.type === "in" ? data.qty : -data.qty;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data: item } = await (supabase as any)
    .from("inventory_items")
    .select("stock")
    .eq("id", data.item_id)
    .single();
  const newStock = (Number(item?.stock ?? 0) + delta);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await (supabase as any)
    .from("inventory_items")
    .update({ stock: Math.max(0, newStock) })
    .eq("id", data.item_id);

  revalidatePath(`/admin/inventory`);
  return ok(null, "স্টক আপডেট হয়েছে।");
}
