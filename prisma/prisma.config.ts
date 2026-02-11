import 'dotenv/config';
import { defineConfig, env } from 'prisma/config';

export default defineConfig({
    datasource: {
        // Use direct connection for migrations (Neon pooled connections don't support migrations)
        url: env('DIRECT_URL'),
    },
    migrations: {
        path: 'prisma/migrations',
    },
});
