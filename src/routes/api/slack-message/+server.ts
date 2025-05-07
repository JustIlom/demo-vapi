import { WebClient } from "@slack/web-api";
import { SLACK_BOT_TOKEN } from "$env/static/private";
import { error, json } from "@sveltejs/kit";

export type VapiInterviewNotificationArgs = {
    interviewerName: string;
    intervieweeName: string;
    evaluation: string;
    transcriptLink: string;
};

const slack = new WebClient(SLACK_BOT_TOKEN);

export async function POST({ request }) {
    const { interviewerName, intervieweeName, evaluation, transcriptLink }:
        VapiInterviewNotificationArgs = await request.json();

    try {
        const userResponse = await slack.users.list({});
        if (!userResponse.ok) {
            console.error(userResponse.error);
            return error(422, userResponse.error);
        }

        const interviewerSlackUser = userResponse.members?.find((user) =>
            user.real_name === interviewerName
        );
        if (!interviewerSlackUser) {
            return error(422, "No matching Slack user found");
        }

        const messageResponse = await slack.chat.postMessage({
            channel: interviewerSlackUser.id!,
            text: `Hi ${interviewerName},
                \nI just finished my call with ${intervieweeName}.
                \n\nThis is my evaluation:
                \n${evaluation}.
                \n\nFor further information please refer to the the transcript: ${transcriptLink}`,
        });

        if (!messageResponse.ok) {
            console.error(messageResponse.error);
            return error(500, messageResponse.error);
        }

        return json({ success: true, ts: messageResponse });
    } catch (e: unknown) {
        console.error("Slack API error:", e);
        return error(500, "Slack API error");
    }
}
