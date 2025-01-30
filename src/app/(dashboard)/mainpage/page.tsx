import { Breadcrumbs } from "@/components/breadcrumbs";
import DotPattern from "@/components/ui/dot-pattern";
import GridPattern from "@/components/ui/grid-pattern";
import { MagicCard } from "@/components/ui/magic-card";
import { cn } from "@/lib/utils";
import Link from "next/link";

export default function Home() {
  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            {
              href: "/",
              label: "Home",
            },
          ]}
        />
      </div>

      <div className="flex flex-col justify-center items-center h-[90vh] gap-11  ">
        <DotPattern
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)]"
          )}
        />
        <div>
          <h1 className="text-center text-4xl md:text-6xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-600">
            Choose a section to manage <br /> your profile or products.
          </h1>
        </div>

        <div className=" grid grid-cols-1 gap-4 md:grid-cols-2">
          <Link href="/dashboard">
            <MagicCard
              className="cursor-pointer flex-col items-center justify-center shadow-2xl px-5 py-20"
              gradientColor={"#262626"}
            >
              <h2 className="text-xl  font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                About Me
              </h2>
              <p className="text-sm">View your messages and public link.</p>
            </MagicCard>
          </Link>
          <Link href="/products">
            <MagicCard
              className="cursor-pointer flex-col items-center justify-center shadow-2xl px-5 py-20"
              gradientColor={"#262626"}
            >
              <h2 className="text-xl  font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400">
                About Product
              </h2>
              <p className="text-sm">Manage your products and reviews.</p>
            </MagicCard>
          </Link>
        </div>
      </div>
    </>
  );
}
