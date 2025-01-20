"use client";

import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react"; // Assuming you have an icon for messages
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import Autoplay from "embla-carousel-autoplay";
import { StarsBackground } from "@/components/ui/stars-background";
import { motion } from "framer-motion";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useState } from "react";
import { cn } from "@/lib/utils";
import Marquee from "@/components/ui/marquee";
import { TextShimmer } from "@/components/ui/text-shimmer";

const messages = [
  {
    name: "Jack",
    username: "@jack",
    body: "Hey, how are you doing today?",
    img: "https://avatar.vercel.sh/jack",
    received: "10 minutes ago",
  },
  {
    name: "Jill",
    username: "@jill",
    body: "I really liked your recent post!",
    img: "https://avatar.vercel.sh/jill",
    received: "2 hours ago",
  },
  {
    name: "John",
    username: "@john",
    body: "Do you have any book recommendations?",
    img: "https://avatar.vercel.sh/john",
    received: "1 hours ago",
  },
  {
    name: "Jane",
    username: "@jane",
    body: "Any plans for the weekend?",
    img: "https://avatar.vercel.sh/jane",
    received: "4 hours ago",
  },
  {
    name: "Jenny",
    username: "@jenny",
    body: "The product seems to be working well. I'm impressed.",
    img: "https://avatar.vercel.sh/jenny",
    received: "30 minutes ago",
  },
  {
    name: "James",
    username: "@james",
    body: "I'm looking forward to the next release.",
    img: "https://avatar.vercel.sh/james",
    received: "1 day ago",
  },
];
const firstRow = messages.slice(0, messages.length / 2);
const secondRow = messages.slice(messages.length / 2);
const ReviewCard = ({
  img,
  name,
  username,
  body,
  received,
}: {
  img: string;
  name: string;
  username: string;
  body: string;
  received: string;
}) => {
  return (
    <figure
      className={cn(
        "relative w-64 cursor-pointer overflow-hidden rounded-xl border p-4",
        // light styles
        // dark styles
        "border-gray-50/[.1] dark:bg-gray-50/[.10] dark:hover:bg-gray-50/[.15]"
      )}
    >
      <div className="flex flex-row items-center gap-2">
        <img className="rounded-full" width="32" height="32" alt="" src={img} />
        <div className="flex flex-col">
          <figcaption className="text-sm font-medium dark:text-white">
            {name}
          </figcaption>
          <p className="text-xs font-medium dark:text-white/40">{username}</p>
        </div>
      </div>
      <blockquote className="mt-2 text-sm">{body}</blockquote>
      <p className="text-xs">{received}</p>
    </figure>
  );
};

export default function Home() {
  const [settings, setSettings] = useState({
    density: 0.00015,
    allTwinkle: true,
    twinkleProbability: 0.7,
    minSpeed: 0.5,
    maxSpeed: 1,
  });
  return (
    <>
      {/* Main content */}
      <main className="!h-[90vh] flex-grow flex flex-col items-center justify-center px-4 bg-black overflow-hidden text-white relative md:px-24 py-12 ">
        <StarsBackground
          starDensity={settings.density}
          allStarsTwinkle={settings.allTwinkle}
          twinkleProbability={settings.twinkleProbability}
          minTwinkleSpeed={settings.minSpeed}
          maxTwinkleSpeed={settings.maxSpeed}
        />
        <section className="text-center mb-8 md:mb-12 ">
          <h1 className="text-4xl md:text-8xl  font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-400 ">
            Speak Up Without Limits
          </h1>
          <TextShimmer
            className="mt-3 md:mt-4 text-base md:text-lg"
            duration={3}
          >
            AnonExchange – Where Honest Feedback Meets Anonymity
          </TextShimmer>
        </section>

        {/* Carousel for Messages */}
        {/* <Carousel
          plugins={[Autoplay({ delay: 2000 })]}
          className="w-full max-w-lg md:max-w-xl"
        >
          <CarouselContent>
            {messages.map((message, index) => (
              <CarouselItem key={index} className="p-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{message.}</CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-col md:flex-row items-start space-y-2 md:space-y-0 md:space-x-4">
                    <Mail className="flex-shrink-0" />
                    <div>
                      <p>{message.content}</p>
                      <p className="text-xs text-muted-foreground">
                        {message.received}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </CarouselItem>
            ))}
          </CarouselContent>
        </Carousel> */}
        <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-lg md:shadow-xl max-w-lg md:max-w-2xl">
          <Marquee pauseOnHover className="[--duration:20s]">
            {firstRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <Marquee reverse pauseOnHover className="[--duration:20s]">
            {secondRow.map((review) => (
              <ReviewCard key={review.username} {...review} />
            ))}
          </Marquee>
          <div className="pointer-events-none absolute inset-y-0 left-0 w-1/3 bg-gradient-to-r from-black dark:from-background"></div>
          <div className="pointer-events-none absolute inset-y-0 right-0 w-1/3 bg-gradient-to-l from-black dark:from-background"></div>
        </div>
      </main>
    </>
  );
}
