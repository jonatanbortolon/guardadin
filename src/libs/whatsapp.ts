import axios from "axios";
import { env } from "@/libs/env";

const GRAPH_API = "https://graph.facebook.com/v22.0";

const authHeader = { Authorization: `Bearer ${env.WHATSAPP_TOKEN}` };

const whatsappClient = axios.create({
	baseURL: `${GRAPH_API}/${env.WHATSAPP_PHONE_NUMBER_ID}/`,
	headers: {
		"Content-Type": "application/json",
		...authHeader,
	},
});

export const whatsapp = {
	async sendMessage(receiverPhoneNumber: string, message: string) {
		await whatsappClient.post("messages", {
			messaging_product: "whatsapp",
			recipient_type: "individual",
			to: receiverPhoneNumber,
			type: "text",
			text: {
				body: message,
			},
		});
	},

	async downloadMedia(mediaId: string) {
		const { data: media } = await axios.get<{ url: string; mime_type: string }>(
			`${GRAPH_API}/${mediaId}`,
			{ headers: authHeader },
		);

		const { data } = await axios.get<ArrayBuffer>(media.url, {
			headers: authHeader,
			responseType: "arraybuffer",
		});

		return {
			base64: Buffer.from(data).toString("base64"),
			mimeType: media.mime_type,
		};
	},
};
