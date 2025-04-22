"use client";
import { Button } from "@/components/ui/button";
import { Input, type Props as InputProps } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import { passwordStrengthCalculator } from "@/utils/password-strength-calculator";
import { EyeIcon, EyeOffIcon } from "lucide-react";
import { forwardRef, useState } from "react";

export type PasswordInputProps = InputProps & {
	showStrength?: boolean;
};

const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(
	({ className, showStrength, ...props }, ref) => {
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
							{showPassword ? "Hide password" : "Show password"}
						</span>
					</Button>

					{/* hides browsers password toggles */}
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
						{Object.entries(passwordStrength).map(([key, value]) => {
							const text =
								key === "minLength"
									? "Maior que 8 caracteres"
									: key === "hasUpperCase"
										? "Pelo menos uma letra maiúscula"
										: key === "hasLowerCase"
											? "Pelo menos uma letra minúscula"
											: key === "hasNumber"
												? "Pelo menos um número"
												: key === "hasSpecialCharacter"
													? "Pelo menos um caractere especial"
													: "";

							return (
								<div key={key} className="flex items-center gap-2">
									<span className="text-xs text-neutral-500">
										{value ? "✅" : "❌"}
									</span>
									<span className="text-xs font-semibold">{text}</span>
								</div>
							);
						})}
					</div>
				) : null}
			</div>
		);
	},
);
PasswordInput.displayName = "PasswordInput";

export { PasswordInput };
