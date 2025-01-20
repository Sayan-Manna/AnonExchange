import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

interface BreadcrumbsProps {
  items: Array<{ href: string; label: string }>;
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <div suppressHydrationWarning>
      <Breadcrumb>
        <BreadcrumbList className="ml-5 md:ml-3 lg:ml-2">
          {/* <BreadcrumbItem>
          <BreadcrumbLink href="/" className="flex items-center">
            <Home className="h-4 w-4 mr-2" />
            Home
          </BreadcrumbLink>
        </BreadcrumbItem> */}
          {/* <BreadcrumbSeparator>
          <ChevronRight className="h-4 w-4" />
        </BreadcrumbSeparator> */}
          {items.map((item, index) => (
            <BreadcrumbItem key={item.href}>
              {index === items.length - 1 ? (
                <BreadcrumbPage className="">{item.label}</BreadcrumbPage>
              ) : (
                <>
                  <BreadcrumbLink asChild>
                    <Link href={item.href}>{item.label}</Link>
                  </BreadcrumbLink>
                  <BreadcrumbSeparator>
                    <ChevronRight className="h-4 w-4" />
                  </BreadcrumbSeparator>
                </>
              )}
            </BreadcrumbItem>
          ))}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
}
