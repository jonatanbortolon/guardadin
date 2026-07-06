"use client";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { ComponentProps } from "react";
import { DayPicker } from "react-day-picker";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/utils/cn";

function Calendar({
	className,
	classNames,
	showOutsideDays = true,
	...props
}: ComponentProps<typeof DayPicker>) {
	return (
		<DayPicker
			showOutsideDays={showOutsideDays}
			className={cn("p-3", className)}
			classNames={{
				months: "flex flex-col sm:flex-row gap-2",
				month: "flex flex-col gap-4 relative",
				month_caption: "flex justify-center pt-1 items-center w-full h-7",
				caption_label: "text-sm font-medium",
				nav: "absolute top-1 inset-x-1 flex items-center justify-between z-10",
				button_previous: cn(
					buttonVariants({ variant: "outline" }),
					"size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
				),
				button_next: cn(
					buttonVariants({ variant: "outline" }),
					"size-7 bg-transparent p-0 opacity-50 hover:opacity-100",
				),
				month_grid: "w-full border-collapse space-y-1",
				weekdays: "flex",
				weekday:
					"text-muted-foreground rounded-md w-8 font-normal text-[0.8rem]",
				week: "flex w-full mt-2",
				day: "relative p-0 text-center text-sm focus-within:relative focus-within:z-20",
				day_button: cn(
					buttonVariants({ variant: "ghost" }),
					"size-8 p-0 font-normal aria-selected:opacity-100",
				),
				range_start:
					"rounded-md aria-selected:bg-primary aria-selected:text-primary-foreground",
				range_end:
					"rounded-md aria-selected:bg-primary aria-selected:text-primary-foreground",
				selected:
					"rounded-md bg-primary text-primary-foreground hover:bg-primary hover:text-primary-foreground focus:bg-primary focus:text-primary-foreground",
				today: "rounded-md bg-accent text-accent-foreground",
				outside:
					"day-outside text-muted-foreground aria-selected:text-muted-foreground",
				disabled: "text-muted-foreground opacity-50",
				range_middle:
					"rounded-md aria-selected:bg-accent aria-selected:text-accent-foreground",
				hidden: "invisible",
				...classNames,
			}}
			components={{
				Chevron: ({ orientation, className: chevronClassName }) =>
					orientation === "left" ? (
						<ChevronLeft className={cn("size-4", chevronClassName)} />
					) : (
						<ChevronRight className={cn("size-4", chevronClassName)} />
					),
			}}
			{...props}
		/>
	);
}

export { Calendar };
