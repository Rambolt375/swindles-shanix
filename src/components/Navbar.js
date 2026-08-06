"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const pathname = usePathname();
  const activeLink =
    pathname === "/"
      ? "home"
      : pathname === "/transactions"
        ? "logs"
        : pathname === "/wishlist"
          ? "wishlist"
          : "";

  return (
    <nav className="bg-blue-50 border-t border-slate-200 p-4 flex justify-around items-center sticky bottom-0">
      <Link
        href="/"
        className={`flex flex-col items-center ${activeLink === "home" ? "text-blue-600" : "text-slate-400"}`}
      >
        <svg
          className="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
          ></path>
        </svg>
        <span className="text-[10px] font-bold">Home</span>
      </Link>

      <Link
        href="/transactions"
        className={`flex flex-col items-center ${activeLink === "logs" ? "text-blue-600" : "text-slate-400"} hover:text-slate-900`}
      >
        <svg
          className="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          ></path>
        </svg>
        <span className="text-[10px] font-bold">Transaction</span>
      </Link>

      <Link
        href="/wishlist"
        className={`flex flex-col items-center ${activeLink === "wishlist" ? "text-blue-600" : "text-slate-400"} hover:text-slate-900`}
      >
        <svg
          className="w-6 h-6 mb-1"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
          ></path>
        </svg>
        <span className="text-[10px] font-bold">Wishlist</span>
      </Link>
    </nav>
  );
}
