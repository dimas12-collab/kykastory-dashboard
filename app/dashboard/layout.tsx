import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { DashboardShell } from "../../components/dashboard-shell";
import { auth } from "../../lib/auth";
import { ProjectCoverSync } from "../../components/project-cover-sync";

export default async function Layout({children}:{children:React.ReactNode}){const session=await auth.api.getSession({headers:await headers()});if(!session)redirect("/login");return <><ProjectCoverSync/><DashboardShell>{children}</DashboardShell></>}
