"use client";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
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
import { BankAccount } from "@/kysely/types/bank-account";
import { Category } from "@/kysely/types/category";
import { formatPrice } from "@/utils/format-price";
import { CSSProperties, useMemo } from "react";
import { Pie, PieChart } from "recharts";

type Props = {
	thisMonthSpent: number;
	thisMonthReceived: number;

	thisMonthSpentCategories: (Category & {
		totalSpent: number | null;
	})[];
	thisMonthSpentWithoutCategory: number | null;

	thisMonthSpentBankAccounts: (BankAccount & {
		totalSpent: number | null;
	})[];
	thisMonthSpentWithoutBankAccount: number | null;

	lastMonthSpent: number;
	lastMonthReceived: number;
};

export function DashboardHome({
	// This month
	thisMonthSpent,
	thisMonthReceived,

	// Spent by category
	thisMonthSpentCategories,
	thisMonthSpentWithoutCategory,

	// Spent by bank account
	thisMonthSpentBankAccounts,
	thisMonthSpentWithoutBankAccount,

	// Last month
	lastMonthSpent,
	lastMonthReceived,
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
				totalSpent: category.totalSpent || 0,
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

	const thisMonthSpentBankAccountsChartData = useMemo(() => {
		const data: (
			| {
					id: `${number}`;
					name: string;
					totalSpent: number;
					fill: string;
					isBankAccount: true;
			  }
			| {
					id: "-1";
					name: string;
					totalSpent: number;
					fill: string;
					isBankAccount: false;
			  }
		)[] = [];

		for (const [index, bankAccount] of thisMonthSpentBankAccounts.entries()) {
			data.push({
				id: `${bankAccount.id}`,
				name: bankAccount.name,
				totalSpent: bankAccount.totalSpent || 0,
				fill: `var(--chart-${Math.abs(((index + 1) % 5) - 5)})`,
				isBankAccount: true,
			});
		}

		if (thisMonthSpentWithoutBankAccount)
			data.push({
				id: "-1",
				name: "Sem conta bancária",
				totalSpent: thisMonthSpentWithoutBankAccount,
				fill: "var(--muted)",
				isBankAccount: false,
			});

		return data;
	}, [thisMonthSpentBankAccounts, thisMonthSpentWithoutBankAccount]);

	const thisMonthSpentBankAccountsChartConfig = useMemo(() => {
		const config: ChartConfig = {};

		for (const [index, bankAccount] of thisMonthSpentBankAccounts.entries()) {
			config[bankAccount.id] = {
				label: bankAccount.name,
				color: `var(--chart-${Math.abs(((index + 1) % 5) - 5)})`,
			};
		}

		if (thisMonthSpentWithoutBankAccount)
			config[-1] = {
				label: "Sem conta bancária",
				color: "var(--muted)",
			};

		return config;
	}, [thisMonthSpentBankAccounts, thisMonthSpentWithoutBankAccount]);

	return (
		<UserZonePageLayout
			title="Dashboard"
			description="Dashboard de seus lançamentos e gastos."
		>
			<div className="w-full h-full flex flex-col gap-4">
				<div className="w-full h-full grid lg:grid-cols-2 grid-cols-1 gap-4 lg:gap-2">
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
				<div className="w-full h-full grid lg:grid-cols-3 grid-cols-1 gap-4 lg:gap-2">
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
					<Card className="flex flex-col">
						<CardHeader className="items-center pb-0">
							<CardTitle>Gastos por conta bancária</CardTitle>
							<CardDescription>
								Gastos por conta bancária deste mês.
							</CardDescription>
						</CardHeader>
						<CardContent className="flex-1 pb-0">
							<ChartContainer
								className="mx-auto aspect-square max-h-[250px]"
								config={thisMonthSpentBankAccountsChartConfig}
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
										data={thisMonthSpentBankAccountsChartData}
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
					<Card className="flex flex-col">
						<CardHeader className="items-center pb-0">
							<CardTitle>Entradas e saídas do mês passado</CardTitle>
							<CardDescription>
								Entradas e saídas do mês passado.
							</CardDescription>
						</CardHeader>
						<CardContent className="w-full h-full flex flex-col justify-center pb-0 gap-8">
							<div className="flex flex-col">
								<span className="text-sm text-bold text-muted-foreground">
									Entradas
								</span>
								<span className="text-4xl font-bold text-primary">
									{formatPrice(lastMonthReceived)}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-bold text-muted-foreground">
									Saídas
								</span>
								<span className="text-4xl font-bold text-destructive">
									{formatPrice(lastMonthSpent)}
								</span>
							</div>
						</CardContent>
					</Card>
				</div>
			</div>
		</UserZonePageLayout>
	);
}
