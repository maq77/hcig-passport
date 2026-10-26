"use client";
// "Talk to our team" opens the contact sheet from anywhere on the page. Without script the link goes to /contacts/.
import type { AnchorHTMLAttributes, ReactNode } from "react";
import { href } from "@/lib/site";

export const openSheet = () => window.dispatchEvent(new CustomEvent("hcig:sheet"));

export function SheetLink({ children, onClick, ...rest }: { children: ReactNode } & AnchorHTMLAttributes<HTMLAnchorElement>) {
  return (
    <a
      href={href("/contacts/")}
      onClick={(e) => {
        onClick?.(e);
        e.preventDefault();
        openSheet();
      }}
      {...rest}
    >
      {children}
    </a>
  );
}
