"use client";
import { ButtonHTMLAttributes, InputHTMLAttributes, ReactNode } from "react";
import { cn } from "./utils";
export function Button({className,...props}:ButtonHTMLAttributes<HTMLButtonElement>){return <button className={cn("inline-flex h-10 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition hover:opacity-85 disabled:opacity-50",className)} {...props}/>}
export function Input({className,...props}:InputHTMLAttributes<HTMLInputElement>){return <input className={cn("h-10 w-full rounded-xl border border-stone-200 bg-white px-3 text-sm outline-none placeholder:text-stone-400 focus:border-stone-500",className)} {...props}/>}
export function Card({children,className}:{children:ReactNode,className?:string}){return <div className={cn("rounded-2xl border border-stone-200/80 bg-white shadow-card",className)}>{children}</div>}
export function Badge({children,tone="neutral"}:{children:ReactNode,tone?:"green"|"orange"|"red"|"neutral"}){return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-[11px] font-bold",tone==="green"&&"bg-emerald-50 text-emerald-700",tone==="orange"&&"bg-orange-50 text-orange-700",tone==="red"&&"bg-red-50 text-red-600",tone==="neutral"&&"bg-stone-100 text-stone-600")}>{children}</span>}
