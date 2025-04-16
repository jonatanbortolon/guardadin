"use client";
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent,
} from "@/components/ui/card";
import {
	ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { Category } from "@/kysely/types/category";
import { formatPrice } from "@/utils/format-price";
import { CSSProperties, useMemo } from "react";
import { Pie, PieChart } from "recharts";

type Props = {
	thisMonthSpent: number;
	thisMonthReceived: number;
	thisMonthSpentCategories: (Category & {
		totalSpent: number;
	})[];
	thisMonthSpentWithoutCategory: number | null;
};

export function DashboardHome({
	thisMonthSpent,
	thisMonthReceived,
	thisMonthSpentCategories,
	thisMonthSpentWithoutCategory,
}: Props) {
	const thisMonthSpentCategoriesChartData = useMemo(() => {
		const data: (
			| {
					id: `${number}`;
					name: string;
					totalSpent: number;
					fill: string;
					isCategory: true;
			  }
			| {
					id: "-1";
					name: string;
					totalSpent: number;
					fill: string;
					isCategory: false;
			  }
		)[] = [];

		for (const [index, category] of thisMonthSpentCategories.entries()) {
			data.push({
				id: `${category.id}`,
				name: category.name,
				totalSpent: category.totalSpent,
				fill: `var(--chart-${(index + 1) % 5})`,
				isCategory: true,
			});
		}

		if (thisMonthSpentWithoutCategory)
			data.push({
				id: "-1",
				name: "Sem categoria",
				totalSpent: thisMonthSpentWithoutCategory,
				fill: "var(--muted)",
				isCategory: false,
			});

		return data;
	}, [thisMonthSpentCategories, thisMonthSpentWithoutCategory]);

	const thisMonthSpentCategoriesChartConfig = useMemo(() => {
		const config: ChartConfig = {};

		for (const [index, category] of thisMonthSpentCategories.entries()) {
			config[category.id] = {
				label: category.name,
				color: `var(--chart-${(index + 1) % 5})`,
			};
		}

		if (thisMonthSpentWithoutCategory)
			config[-1] = {
				label: "Sem categoria",
				color: "var(--muted)",
			};

		return config;
	}, [thisMonthSpentCategories, thisMonthSpentWithoutCategory]);

	return (
		<UserZonePageLayout
			title="Dashboard"
			description="Dashboard de seus lançamentos e gastos."
		>
			<div className="w-full h-full flex flex-col gap-4">
				<div className="w-full h-full grid lg:grid-cols-2 grid-cols-1 gap-2">
					<Card className="lg:ml-auto lg:w-96">
						<CardHeader>
							<CardTitle>Saída</CardTitle>
							<CardDescription>
								Sua saída até o momento neste mês.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="w-full h-full items-center justify-center">
								<span className="text-4xl font-bold text-destructive">
									{formatPrice(thisMonthSpent)}
								</span>
							</div>
						</CardContent>
					</Card>
					<Card className="lg:mr-auto lg:w-96">
						<CardHeader>
							<CardTitle>Entrada</CardTitle>
							<CardDescription>
								Sua entrada até o momento neste mês.
							</CardDescription>
						</CardHeader>
						<CardContent>
							<div className="w-full h-full items-center justify-center">
								<span className="text-4xl font-bold text-primary">
									{formatPrice(thisMonthReceived)}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
				<div className="w-full h-full grid lg:grid-cols-3 grid-cols-1 gap-2">
					<Card className="flex flex-col">
						<CardHeader className="items-center pb-0">
							<CardTitle>Gastos por categoria</CardTitle>
							<CardDescription>
								Gastos por categorias deste mês.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 pb-0">
							<ChartContainer
								className="mx-auto aspect-square max-h-[250px]"
								config={thisMonthSpentCategoriesChartConfig}
							>
								<PieChart>
									<ChartTooltip
										cursor={false}
										content={
											<ChartTooltipContent
												hideLabel
												formatter={(value, _id, { payload: { payload } }) => (
													<>
														<div
															className="h-2.5 w-2.5 shrink-0 rounded-[2px] border-(--color-border) bg-(--color-bg)"
															style={
																{
																	"--color-bg": payload.fill,
																	"--color-border": payload.fill,
																} as CSSProperties
															}
														/>
														<div className="flex flex-1 justify-between leading-none items-center gap-1.5">
															<span className="text-muted-foreground">
																{payload.name}
															</span>
															<span className="text-foreground font-mono font-medium tabular-nums">
																{formatPrice(
																	typeof value === "number" ? value : 0,
																)}
															</span>
														</div>
													</>
												)}
											/>
										}
									/>
									<Pie
										data={thisMonthSpentCategoriesChartData}
										dataKey="totalSpent"
									/>
									<ChartLegend
										className="-translate-y-2 flex-wrap gap-2 [&>*]:basis-1/4 [&>*]:justify-center whitespace-nowrap"
										content={<ChartLegendContent nameKey="id" />}
									/>
								</PieChart>
							</ChartContainer>
						</CardContent>
					</Card>
				</div>
			</div>
		</UserZonePageLayout>
	);
}
