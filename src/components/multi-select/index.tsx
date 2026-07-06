"use client";
import { CheckIcon, ChevronsUpDownIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
	Command,
	CommandEmpty,
	CommandGroup,
	CommandInput,
	CommandItem,
	CommandList,
} from "@/components/ui/command";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from "@/utils/cn";

export type MultiSelectOption = {
	value: number;
	label: string;
};

type Props = {
	options: MultiSelectOption[];
	value: number[];
	onChange: (value: number[]) => void;
	placeholder: string;
	searchPlaceholder: string;
	emptyText: string;
	selectedText: (count: number) => string;
};

export function MultiSelect({
	options,
	value,
	onChange,
	placeholder,
	searchPlaceholder,
	emptyText,
	selectedText,
}: Props) {
	function toggle(option: number) {
		if (value.includes(option)) {
			onChange(value.filter((item) => item !== option));
			return;
		}

		onChange([...value, option]);
	}

	return (
		<Popover>
			<PopoverTrigger asChild>
				<Button
					variant="outline"
					className="w-full justify-between font-normal"
				>
					<span className="truncate">
						{value.length ? selectedText(value.length) : placeholder}
					</span>
					<ChevronsUpDownIcon className="h-4 w-4 opacity-50" />
				</Button>
			</PopoverTrigger>
			<PopoverContent className="w-[240px] p-0" align="start">
				<Command>
					<CommandInput placeholder={searchPlaceholder} />
					<CommandList>
						<CommandEmpty>{emptyText}</CommandEmpty>
						<CommandGroup>
							{options.map((option) => (
								<CommandItem
									key={option.value}
									value={option.label}
									onSelect={() => toggle(option.value)}
								>
									<CheckIcon
										className={cn(
											"h-4 w-4",
											value.includes(option.value)
												? "opacity-100"
												: "opacity-0",
										)}
									/>
									{option.label}
								</CommandItem>
							))}
						</CommandGroup>
					</CommandList>
				</Command>
			</PopoverContent>
		</Popover>
	);
}
