import { google } from "@ai-sdk/google";
import { streamText } from "ai";

// let limits = {
//   message: 0,
//   data: 0,
// };

export async function POST(req: Request) {
  try {
    // Increment the request counts
    // limits.message++;
    // limits.data++;

    // console.log(`Message count: ${limits.message}`);
    // console.log(`Data count: ${limits.data}`);

    // if (limits.message <= 12 || limits.data <= 1450) {
    const prompt =
      "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?||If you could have dinner with any historical figure, who would it be?||What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.";

    const response = await streamText({
      model: google("gemini-1.5-flash"),
      prompt: prompt,
    });
    return response.toDataStreamResponse();
    // }
    // if (limits.message > 12) {
    //   setTimeout(() => {
    //     limits.message = 0;
    //   }, 60000); // Reset message limit after 1 minute
    // }

    // if (limits.data > 1450) {
    //   setTimeout(() => {
    //     limits.data = 0;
    //   }, 1440000); // Reset data limit after 24 minutes
    // }
    return Response.json(
      {
        success: false,
        message: "Try again later.",
        // limits.message > 12
        //   ? "Message limit exceeded. Try again later."
        //   : "Data limit exceeded. Try again later.",
      },
      { status: 403 }
    );
  } catch (error) {
    console.error("An error occured in suggest-messages");
    return Response.json(
      {
        success: false,
        message: "This feature isn't available at the moment. Try again later",
      },
      { status: 500 }
    );
  }
}
