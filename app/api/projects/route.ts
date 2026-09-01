import { NextResponse } from "next/server"; import { projects } from "../../../db/schema"; import { bootstrap } from "../../../lib/server";
export async function GET(){bootstrap(); return NextResponse.json({data:{id:"demo-project",name:"Wedding Chika & Fariz",coupleName:"Chika & Fariz",slug:"chika-fariz",eventDate:"2026-10-17",invitationUrl:"kykastory.com/chika-fariz",status:"ACTIVE"}});}
