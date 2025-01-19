"use client";

import { MessageCard } from "@/components/MessageCard";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Message } from "@/model/User";
import { ApiResponse } from "@/types/ApiResponse";
import { zodResolver } from "@hookform/resolvers/zod";
import axios, { AxiosError } from "axios";
import { Loader2, RefreshCcw } from "lucide-react";
import { User } from "next-auth";
import { useSession } from "next-auth/react";
import React, { useCallback, useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { AcceptMessageSchema } from "@/schemas/acceptMessageSchema";
import { Squares } from "@/components/ui/squares-background";
import { Breadcrumbs } from "@/components/breadcrumbs";
import GridPattern from "@/components/ui/grid-pattern";
import { cn } from "@/lib/utils";
import ScriptCopyBtn from "@/components/ui/script-copy-btn";

function UserDashboard() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isSwitchLoading, setIsSwitchLoading] = useState(false);

  const { toast } = useToast();

  const handleDeleteMessage = (messageId: string) => {
    setMessages(messages.filter((message) => message._id !== messageId));
  };

  const { data: session } = useSession();
  // console.log("session: ", session);

  const form = useForm({
    resolver: zodResolver(AcceptMessageSchema),
  });

  const { register, watch, setValue } = form;
  const acceptMessages = watch("acceptMessages");

  const fetchAcceptMessages = useCallback(async () => {
    setIsSwitchLoading(true);
    try {
      const response = await axios.get<ApiResponse>("/api/accept-messages");
      setValue("acceptMessages", response.data.isAcceptingMessages);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to fetch message settings",
        variant: "destructive",
      });
    } finally {
      setIsSwitchLoading(false);
    }
  }, [setValue, toast]);

  const fetchMessages = useCallback(
    async (refresh: boolean = false) => {
      setIsLoading(true);
      setIsSwitchLoading(false);
      try {
        const response = await axios.get<ApiResponse>("/api/get-messages");
        setMessages(response.data.messages || []);
        if (refresh) {
          toast({
            title: "Refreshed Messages",
            description: "Showing latest messages",
          });
        }
      } catch (error) {
        const axiosError = error as AxiosError<ApiResponse>;
        toast({
          title: "Error",
          description:
            axiosError.response?.data.message ?? "Failed to fetch messages",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
        setIsSwitchLoading(false);
      }
    },
    [setIsLoading, setMessages, toast]
  );

  // Fetch initial state from the server
  useEffect(() => {
    if (!session || !session.user) return;

    fetchMessages();

    fetchAcceptMessages();
  }, [session, setValue, toast, fetchAcceptMessages, fetchMessages]);

  // Handle switch change
  const handleSwitchChange = async () => {
    try {
      const response = await axios.post<ApiResponse>("/api/accept-messages", {
        acceptMessages: !acceptMessages,
      });
      setValue("acceptMessages", !acceptMessages);
      toast({
        title: response.data.message,
        variant: "default",
      });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ??
          "Failed to update message settings",
        variant: "destructive",
      });
    }
  };

  if (!session || !session.user) {
    return <div></div>;
  }

  const { username } = session.user as User;
  // console.log("username", username);

  const baseUrl = `${window.location.protocol}//${window.location.host}`;
  const profileUrl = `${baseUrl}/u/${username}`;

  // const copyToClipboard = () => {
  //   navigator.clipboard.writeText(profileUrl);
  //   toast({
  //     title: "URL Copied!",
  //     description: "Profile URL has been copied to clipboard.",
  //   });
  // };
  const customCommandMap = {
    "public url": `${profileUrl}`,
  };

  return (
    <>
      <div className="breadcrumb-wrapper">
        <Breadcrumbs
          items={[
            { href: "/", label: "Home" },
            { href: "/dashboard", label: "About Me" },
          ]}
        />
      </div>

      <div className="relative w-full p-40 ">
        {/* Squares Background */}
        <GridPattern
          width={30}
          height={30}
          x={-1}
          y={-1}
          strokeDasharray={"4 2"}
          className={cn(
            "[mask-image:radial-gradient(500px_circle_at_center,white,transparent)] !w-full"
          )}
        />

        {/* Dashboard Content */}
        <div className="relative flex flex-col gap-11 mx-auto text-white rounded">
          <h1 className="text-center text-7xl font-bold bg-clip-text text-transparent bg-gradient-to-b from-neutral-50 to-neutral-600">
            User Dashboard
          </h1>

          {/* <div className="mb-4">
            <h2 className="text-lg font-semibold mb-2">
              Copy Your Unique Link
            </h2>
            <div className="flex items-center">
              <input
                type="text"
                value={profileUrl}
                disabled
                className="w-full p-2 mr-2"
              />
              <Button onClick={copyToClipboard}>Copy</Button>
            </div>
          </div> */}
          <div className="">
            <ScriptCopyBtn
              showMultiplePackageOptions={true}
              codeLanguage="shell"
              lightTheme="nord"
              darkTheme="vitesse-dark"
              commandMap={customCommandMap}
            />
          </div>

          <div className="flex">
            <Switch
              {...register("acceptMessages")}
              checked={acceptMessages}
              onCheckedChange={handleSwitchChange}
              disabled={isSwitchLoading}
            />
            <span className="ml-2">
              Accept Messages: {acceptMessages ? "On" : "Off"}
            </span>
          </div>
          <div>
            <Button
              className=""
              variant="outline"
              onClick={(e) => {
                e.preventDefault();
                fetchMessages(true);
              }}
            >
              {isLoading ? (
                <Loader2 className="!h-4 !w-4 animate-spin" />
              ) : (
                <RefreshCcw className="!h-4 !w-4" />
              )}
            </Button>
          </div>
          <div className="overflow-y-auto h-[30rem]">
            <div className=" grid grid-cols-1 md:grid-cols-2 gap-6">
              {messages.length > 0 ? (
                messages.map((message, index) => (
                  <MessageCard
                    key={message._id as string}
                    message={message}
                    onMessageDelete={handleDeleteMessage}
                  />
                ))
              ) : (
                <p>No messages to display.</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default UserDashboard;
