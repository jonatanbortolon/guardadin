"use client";
import { useTranslations } from "next-intl";
import { type CSSProperties, useMemo } from "react";
import { Pie, PieChart } from "recharts";
import {
	Card,
	CardContent,
	CardDescription,
	CardHeader,
	CardTitle,
} from "@/components/ui/card";
import {
	type ChartConfig,
	ChartContainer,
	ChartLegend,
	ChartLegendContent,
	ChartTooltip,
	ChartTooltipContent,
} from "@/components/ui/chart";
import { UserZonePageLayout } from "@/components/user-zone-page-layout";
import { useDashboard } from "@/hooks/use-dashboard";
import { formatPrice } from "@/utils/format-price";

export default function Page() {
	const t = useTranslations("dashboard");
	const { data } = useDashboard();

	const thisMonthSpent = data?.thisMonthSpent ?? 0;
	const thisMonthReceived = data?.thisMonthReceived ?? 0;
	const thisMonthSpentCategories = data?.thisMonthSpentCategories ?? [];
	const thisMonthSpentWithoutCategory =
		data?.thisMonthSpentWithoutCategory ?? null;
	const thisMonthSpentBankAccounts = data?.thisMonthSpentBankAccounts ?? [];
	const thisMonthSpentWithoutBankAccount =
		data?.thisMonthSpentWithoutBankAccount ?? null;
	const lastMonthSpent = data?.lastMonthSpent ?? 0;
	const lastMonthReceived = data?.lastMonthReceived ?? 0;
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
				name: t("withoutCategory"),
				totalSpent: thisMonthSpentWithoutCategory,
				fill: "var(--muted)",
				isCategory: false,
			});

		return data;
	}, [thisMonthSpentCategories, thisMonthSpentWithoutCategory, t]);

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
				label: t("withoutCategory"),
				color: "var(--muted)",
			};

		return config;
	}, [thisMonthSpentCategories, thisMonthSpentWithoutCategory, t]);

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
				name: t("withoutBankAccount"),
				totalSpent: thisMonthSpentWithoutBankAccount,
				fill: "var(--muted)",
				isBankAccount: false,
			});

		return data;
	}, [thisMonthSpentBankAccounts, thisMonthSpentWithoutBankAccount, t]);

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
				label: t("withoutBankAccount"),
				color: "var(--muted)",
			};

		return config;
	}, [thisMonthSpentBankAccounts, thisMonthSpentWithoutBankAccount, t]);

	return (
		<UserZonePageLayout title={t("title")} description={t("description")}>
			<div className="w-full h-full flex flex-col gap-4">
				<div className="w-full h-full grid lg:grid-cols-2 grid-cols-1 gap-4 lg:gap-2">
					<Card className="lg:ml-auto lg:w-96">
						<CardHeader>
							<CardTitle>{t("spentTitle")}</CardTitle>
							<CardDescription>{t("spentDescription")}</CardDescription>
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
							<CardTitle>{t("receivedTitle")}</CardTitle>
							<CardDescription>{t("receivedDescription")}</CardDescription>
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
							<CardTitle>{t("spentByCategory")}</CardTitle>
							<CardDescription>
								{t("spentByCategoryDescription")}
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
												formatter={(value, _id, { payload }) => (
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
							<CardTitle>{t("spentByBankAccount")}</CardTitle>
							<CardDescription>
								{t("spentByBankAccountDescription")}
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
												formatter={(value, _id, { payload }) => (
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
							<CardTitle>{t("lastMonthTitle")}</CardTitle>
							<CardDescription>{t("lastMonthDescription")}</CardDescription>
						</CardHeader>
						<CardContent className="w-full h-full flex flex-col justify-center pb-0 gap-8">
							<div className="flex flex-col">
								<span className="text-sm text-bold text-muted-foreground">
									{t("incomes")}
								</span>
								<span className="text-4xl font-bold text-primary">
									{formatPrice(lastMonthReceived)}
								</span>
							</div>
							<div className="flex flex-col">
								<span className="text-sm text-bold text-muted-foreground">
									{t("expenses")}
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
