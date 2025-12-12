import type { AnyPgTable } from "drizzle-orm/pg-core";

import { eq, getTableName } from "drizzle-orm";
import { createSelectSchema } from "drizzle-typebox";
import { Elysia, status, t } from "elysia";
import { capitalize } from "lodash-es";

import { betterAuth } from "../betterAuth";
import { db } from "../database";

const paramsSchema = t.Object({
	id: t.String({ pattern: String.raw`^\d+$` }),
});

export const createEntityEndpoints = (table: AnyPgTable) => {
	const selectSchema = createSelectSchema(table);
	const insertSchema = t.Omit(selectSchema, ["id", "createdAt", "updatedAt"]);
	const updateSchema = t.Partial(insertSchema);
	const tableName = getTableName(table);
	const entityName = capitalize(tableName);

	return new Elysia()
		.use(betterAuth)
		.get("/", ({ query }) => db.select().from(table).limit(query.limit).offset(query.offset), {
			auth: true,
			detail: { description: `Reads ${entityName} list`, tags: [entityName] },
			query: t.Object({
				limit: t.Number({ default: 10, description: "Limit the number of entities to return" }),
				offset: t.Number({ default: 0, description: "Offset the number of entities to return" }),
			}),
			response: {
				200: t.Array(selectSchema),
				401: t.Literal("Unauthorized"),
			},
		})
		.post("/", ({ body }) => db.insert(table).values(body).returning(), {
			auth: true,
			body: insertSchema,
			detail: { description: `Creates a new ${entityName}`, tags: [entityName] },
			response: {
				201: selectSchema,
				401: t.Literal("Unauthorized"),
			},
		})
		.get(
			"/:id",
			async ({ params }) => {
				const items = await db
					.select()
					.from(table)
					// @ts-expect-error лень уточнять тип аргументов
					.where(eq(table.id, Number(params.id)));

				if (items.length === 0) {
					return status(404, "Not Found");
				}

				return items.at(0);
			},
			{
				auth: true,
				detail: { description: `Reads ${entityName} by id`, tags: [entityName] },
				params: paramsSchema,
				response: {
					200: selectSchema,
					401: t.Literal("Unauthorized"),
					404: t.Literal("Not Found"),
				},
			}
		)
		.patch(
			"/:id",
			async ({ body, params }) => {
				const items = await db
					.update(table)
					.set(body)
					// @ts-expect-error лень уточнять тип аргументов
					.where(eq(table.id, Number(params.id)))
					.returning();

				if (items.length === 0) {
					return status(404, "Not Found");
				}

				return items.at(0);
			},
			{
				auth: true,
				body: updateSchema,
				detail: { description: `Updates ${entityName} by id`, tags: [entityName] },
				params: paramsSchema,
				response: {
					200: selectSchema,
					401: t.Literal("Unauthorized"),
					404: t.Literal("Not Found"),
				},
			}
		)
		.delete(
			"/:id",
			async ({ params }) => {
				const items = await db
					.delete(table)
					// @ts-expect-error лень уточнять тип аргументов
					.where(eq(table.id, Number(params.id)))
					.returning();

				if (items.length === 0) {
					return status(404, "Not Found");
				}

				return items.at(0);
			},
			{
				auth: true,
				detail: { description: `Deletes ${entityName} by id`, tags: [entityName] },
				params: paramsSchema,
				response: {
					204: selectSchema,
					401: t.Literal("Unauthorized"),
					404: t.Literal("Not Found"),
				},
			}
		);
};
