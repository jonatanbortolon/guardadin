"use client";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { useTranslations } from "next-intl";
import { forwardRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input, type Props as InputProps } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { passwordStrengthCalculator } from "@/utils/password-strength-calculator";

export type PasswordInputProps = InputProps & {
	showStrength?: boolean;
};

type StrengthKey = keyof ReturnType<typeof passwordStrengthCalculator>;

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, showStrength, ...props }, ref) => {
		const t = useTranslations("password");
		const [showPassword, setShowPassword] = useState(false);

		const passwordStrength = showStrength
			? passwordStrengthCalculator(props.value?.toString() || "")
			: undefined;

		return (
			<div>
				<div className="relative">
					<Input
						type={showPassword ? "text" : "password"}
						className={cn("hide-password-toggle pr-10", className)}
						ref={ref}
						{...props}
					/>
					<Button
						type="button"
						variant="ghost"
						size="sm"
						className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
						onClick={() => setShowPassword((prev) => !prev)}
					>
						{showPassword ? (
							<EyeIcon className="h-4 w-4" aria-hidden="true" />
						) : (
							<EyeOffIcon className="h-4 w-4" aria-hidden="true" />
						)}
						<span className="sr-only">
							{showPassword ? t("hide") : t("show")}
						</span>
					</Button>

					{}
					<style>{`
                        .hide-password-toggle::-ms-reveal,
                        .hide-password-toggle::-ms-clear {
                            visibility: hidden;
                            pointer-events: none;
                            display: none;
                        }
                    `}</style>
				</div>
				{passwordStrength ? (
					<div className="mt-2">
						{Object.entries(passwordStrength).map(([key, value]) => (
							<div key={key} className="flex items-center gap-2">
								<span className="text-xs text-neutral-500">
									{value ? "✅" : "❌"}
								</span>
								<span className="text-xs font-semibold">
									{t(key as StrengthKey)}
								</span>
							</div>
						))}
					</div>
				) : null}
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
