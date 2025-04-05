export type whatsappWebhookPayload = {
	object: "whatsapp_business_account";
	entry: [
		{
			id: string;
			changes: [
				{
					value: {
						messaging_product: "whatsapp";
						metadata: {
							display_phone_number: string;
							phone_number_id: string;
						};
						contacts: {
							wa_id: string;
							user_id: string;
							profile: {
								name: string;
							};
						}[];
						errors: {
							code: number;
							title: string;
							message: string;
							error_data: {
								details: string;
							};
						}[];
						messages: {
							audio?: {
								id: string;
								mime_type: string;
							};
							button?: {
								payload: string;
								text: string;
							};
							context?: {
								forwarded: boolean;
								frequently_forwarded: boolean;
								from: string;
								id: string;
								referred_product: {
									catalog_id: string;
									product_retailer_id: string;
								};
							};
							document?: {
								caption: string;
								filename: string;
								sha256: string;
								mime_type: string;
								id: string;
							};
							errors: {
								code: number;
								title: string;
								message: string;
								error_data: {
									details: string;
								};
							}[];
							from: string;
							id: string;
							identity?: {
								acknowledged: string;
								created_timestamp: string;
								hash: string;
							};
							image?: {
								caption: string;
								sha256: string;
								id: string;
								mime_type: string;
							};
							interactive?: {
								type: {
									button_reply: {
										id: string;
										title: string;
									};
									list_reply: {
										id: string;
										title: string;
										description: string;
									};
								};
							};
							order?: {
								catalog_id: string;
								text: string;
								product_items: {
									product_retailer_id: string;
									quantity: string;
									item_price: string;
									currency: string;
								}[];
							};
							referral: {
								source_url: string;
								source_type: string;
								source_id: string;
								headline: string;
								body: string;
								media_type: string;
								image_url: string;
								video_url: string;
								thumbnail_url: string;
								ctwa_clid: string;
							};
							sticker?: {
								mime_type: string;
								sha256: string;
								id: string;
								animated: boolean;
							};
							system?: {
								body: string;
								identity: string;
								new_wa_id: string;
								wa_id: string;
								type: "customer_changed_number" | "customer_identity_changed";
								customer: string;
							};
							text?: {
								body: string;
							};
							timestamp: string;
							type:
								| "audio"
								| "button"
								| "document"
								| "text"
								| "image"
								| "interactive"
								| "order"
								| "sticker"
								| "system"
								| "unknown"
								| "video";
							video?: {
								caption: string;
								sha256: string;
								id: string;
								mime_type: string;
							};
						}[];
						statuses: {
							biz_opaque_callback_data: string;
							conversation: {
								id: string;
								origin: {
									type: {
										authentication: string;
										marketing: string;
										utility: string;
										service: string;
										referral_conversion: string;
									};
								};
								expiration_timestamp: string;
							};
							errors: {
								code: number;
								title: string;
								message: string;
								error_data: {
									details: string;
								};
							}[];
							id: string;
							pricing: {
								category: {
									authentication: string;
									"authentication-international": string;
									marketing: string;
									utility: string;
									service: string;
									referral_conversion: string;
								};
								pricing_model: "CBP";
							};
							recipient_id: string;
							status: "delivered" | "read" | "sent";
							timestamp: string;
						}[];
					};
					field: string;
				},
			];
		},
	];
};
