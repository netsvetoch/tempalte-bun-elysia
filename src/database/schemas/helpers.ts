import { text } from "drizzle-orm/pg-core";

const dateNow = () => new Date().toISOString();

export const timestamps = {
	createdAt: text("created_at").$defaultFn(dateNow).notNull(),
	updatedAt: text("updated_at").$defaultFn(dateNow).$onUpdate(dateNow).notNull(),
};
