import { betterAuth } from "better-auth"; import Database from "better-sqlite3"; import path from "path"; import { ensureDatabase } from "../db"; import { ensureAuthColumns } from "../db/auth-migrations";
ensureDatabase();
ensureAuthColumns();
export const auth=betterAuth({database:new Database(path.join(process.cwd(),"data","kykastory.db")), secret:process.env.BETTER_AUTH_SECRET||"kykastory-local-development-secret-change-me", baseURL:process.env.BETTER_AUTH_URL||"http://localhost:3000", emailAndPassword:{enabled:true}, trustedOrigins:["http://localhost:3000"]});
