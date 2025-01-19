import { Message } from "@/model/User";

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  product?: T;
  isAcceptingMessages?: boolean;
  messages?: Array<Message>;
}
