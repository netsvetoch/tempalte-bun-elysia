import { cors } from "@elysiajs/cors";
import { swagger } from "@elysiajs/swagger";
import { Elysia } from "elysia";

import { betterAuth } from "./betterAuth";
import { entityTable } from "./database";
import { createEntityEndpoints } from "./helpers";
import { OpenAPI } from "./OpenAPI";

const port = 3000;

// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const openApiComponents = await OpenAPI.components;
// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
const openApiPaths = await OpenAPI.getPaths();

new Elysia()
	.use(cors())
	.use(
		swagger({
			autoDarkMode: true,
			documentation: {
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				components: openApiComponents,
				// eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
				paths: openApiPaths,
			},
			path: "/docs",
			scalarConfig: {
				defaultOpenAllTags: false,
			},
		})
	)
	.use(betterAuth)
	.group("/entities", app => app.use(createEntityEndpoints(entityTable)))
	.listen(port);

console.log(`Swagger docs available at http://localhost:${port}/docs`);
