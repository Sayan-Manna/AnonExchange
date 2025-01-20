"use client";

import React from "react";
import axios, { AxiosError } from "axios";
import dayjs from "dayjs";
import { X } from "lucide-react";
import { Message } from "@/model/User";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "./ui/button";
import { ApiResponse } from "@/types/ApiResponse";
import { useToast } from "@/hooks/use-toast";

type MessageCardProps = {
  message: Message;
  onMessageDelete?: (messageId: string) => void;
};

export function MessageCard({ message, onMessageDelete }: MessageCardProps) {
  const { toast } = useToast();

  const handleDeleteConfirm = async () => {
    try {
      const response = await axios.delete<ApiResponse>(
        `/api/delete-message/${message._id}`
      );
      toast({
        title: response.data.message,
      });
      onMessageDelete?.(message._id as string);
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast({
        title: "Error",
        description:
          axiosError.response?.data.message ?? "Failed to delete message",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="h-full flex flex-col md:w-full border rounded shadow-sm">
      {/* Header with title and delete button */}
      <CardHeader className="mb-2">
        <div className="flex justify-between items-center">
          {/* Title */}
          <CardTitle className="text-lg font-medium truncate w-5/6">
            {message.content}
          </CardTitle>
          {/* Delete button */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button variant="destructive">
                <X className="w-5 h-5" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
              <AlertDialogHeader>
                <AlertDialogTitle>Are you absolutely sure?</AlertDialogTitle>
                <AlertDialogDescription>
                  This action cannot be undone. This will permanently delete
                  this message.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel>Cancel</AlertDialogCancel>
                <AlertDialogAction onClick={handleDeleteConfirm}>
                  Continue
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
        {/* Date */}
        <div className="text-sm text-gray-500">
          {dayjs(message.createdAt).format("MMM D, YYYY h:mm A")}
        </div>
      </CardHeader>
      {/* Content */}
      <CardContent className="flex-grow overflow-hidden">
        <p className="text-gray-700 text-sm line-clamp-3 break-words">
          {message.content}
        </p>
      </CardContent>
    </Card>
  );
}
