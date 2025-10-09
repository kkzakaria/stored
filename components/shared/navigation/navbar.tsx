"use client";

import * as React from "react";
import Link from "next/link";
import { useSidebar } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import { UserMenu } from "./user-menu";
import { PanelLeft } from "lucide-react";
import { useUIStore } from "@/lib/stores";

export function Navbar() {
  const { toggleSidebar } = useSidebar();
  const { breadcrumbs } = useUIStore();

  return (
    <header className="sticky top-0 z-10 flex h-16 shrink-0 items-center gap-4 border-b bg-background px-4">
      <Button
        variant="ghost"
        size="icon"
        className="md:hidden"
        onClick={toggleSidebar}
      >
        <PanelLeft className="size-5" />
        <span className="sr-only">Toggle sidebar</span>
      </Button>

      {breadcrumbs.length > 0 && (
        <>
          <Separator orientation="vertical" className="h-6" />
          <Breadcrumb>
            <BreadcrumbList>
              {breadcrumbs.map((item, index) => {
                const isLast = index === breadcrumbs.length - 1;

                return (
                  <React.Fragment key={index}>
                    <BreadcrumbItem>
                      {isLast || !item.href ? (
                        <BreadcrumbPage>{item.label}</BreadcrumbPage>
                      ) : (
                        <BreadcrumbLink asChild>
                          <Link href={item.href}>{item.label}</Link>
                        </BreadcrumbLink>
                      )}
                    </BreadcrumbItem>
                    {!isLast && <BreadcrumbSeparator />}
                  </React.Fragment>
                );
              })}
            </BreadcrumbList>
          </Breadcrumb>
        </>
      )}

      <div className="ml-auto flex items-center gap-2">
        <UserMenu />
      </div>
    </header>
  );
}
