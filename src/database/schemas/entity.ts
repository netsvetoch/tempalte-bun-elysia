import { pgTable, serial, text } from "drizzle-orm/pg-core";

import { timestamps } from "./helpers";

export const entityTable = pgTable("entity", {
	id: serial("id").primaryKey(),
	name: text("name").notNull(),
	...timestamps,
});
