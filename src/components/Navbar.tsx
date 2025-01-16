"use client";

import React from "react";
import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { Button } from "./ui/button";
import { User } from "next-auth";

import { ArrowRightIcon } from "@radix-ui/react-icons";

import { cn } from "@/lib/utils";
import AnimatedShinyText from "@/components/ui/animated-shiny-text";
import { ShimmerButton } from "./ui/shimmer-button";
function Navbar() {
  const { data: session } = useSession();
  const user: User = session?.user;

  return (
    <nav className="p-4 md:p-6 shadow-md bg-black text-white">
      <div className="container mx-auto flex flex-col md:flex-row justify-between items-center">
        <a href="#" className="text-xl font-bold mb-4 md:mb-0">
          AnonExchange
        </a>
        {session ? (
          <>
            <span className="mr-4">Welcome, {user.username || user.email}</span>
            <ShimmerButton
              onClick={() => signOut()}
              className="shadow-2xl w-full md:w-auto !py-2"
            >
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Log Out
              </span>
            </ShimmerButton>
          </>
        ) : (
          <Link href="/sign-in">
            <ShimmerButton className="shadow-2xl w-full md:w-auto !py-2">
              <span className="whitespace-pre-wrap text-center text-sm font-medium leading-none tracking-tight text-white dark:from-white dark:to-slate-900/10 lg:text-lg">
                Log In
              </span>
            </ShimmerButton>
          </Link>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
