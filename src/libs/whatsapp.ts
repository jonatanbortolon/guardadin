import { env } from "@/libs/env";
import axios from "axios";

const whatsappClient = axios.create({
	baseURL: `https://graph.facebook.com/v22.0/${env.WHATSAPP_PHONE_NUMBER_ID}/`,
	headers: {
		"Content-Type": "application/json",
		Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
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
};
