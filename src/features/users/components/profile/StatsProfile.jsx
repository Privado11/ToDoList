import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { TrendingUp, BarChart3, ChartPie } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Pie,
  XAxis,
  PieChart,
  LabelList,
} from "recharts";
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { useEffect, useMemo, useState } from "react";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";

const chartConfig = {
  completed: {
    label: "Completed",
    color: "hsl(var(--completed))",
  },
  pending: {
    label: "Pending",
    color: "hsl(var(--pending))",
  },
  countTasks: {
    label: "Tasks",
  },
  work: {
    label: "Work",
    color: "hsl(var(--work))",
  },
  personal: {
    label: "Personal",
    color: "hsl(var(--personal))",
  },
  study: {
    label: "Study",
    color: "hsl(var(--study))",
  },
  home: {
    label: "Home",
    color: "hsl(var(--home))",
  },
  health: {
    label: "Health",
    color: "hsl(var(--health))",
  },
  finance: {
    label: "Finance",
    color: "hsl(var(--finance))",
  },
  social: {
    label: "Social",
    color: "hsl(var(--social))",
  },
  projects: {
    label: "Projects",
    color: "hsl(var(--projects))",
  },
  shopping: {
    label: "Shopping",
    color: "hsl(var(--shopping))",
  },
  others: {
    label: "Others",
    color: "hsl(var(--others))",
  },
};

const categoryColorMap = {
  work: "hsl(var(--work))",
  personal: "hsl(var(--personal))",
  study: "hsl(var(--study))",
  home: "hsl(var(--home))",
  health: "hsl(var(--health))",
  finance: "hsl(var(--finance))",
  social: "hsl(var(--social))",
  projects: "hsl(var(--projects))",
  shopping: "hsl(var(--shopping))",
  others: "hsl(var(--others))",
};

const StatsProfile = ({ chartData }) => {
  const [selectedPeriod, setSelectedPeriod] = useState("weekly");
  const weeklyData = chartData?.weeklyChartData;
  const monthlyData = chartData?.monthlyChartData;
  const currentData = selectedPeriod === "weekly" ? weeklyData : monthlyData;
  const currentTotals = currentData?.totals;
  const categoryStats = chartData?.categoriesData;
  const comparisonData = chartData?.comparisonData;
  const [pieChartData, setPieChartData] = useState([]);
  const MAX_CATEGORIES_BEFORE_GROUPING = 4;

  const completionRate =
    currentTotals?.total > 0
      ? Math.round((currentTotals.completed / currentTotals.total) * 100)
      : 0;

  const currentComparison =
    selectedPeriod === "weekly"
      ? comparisonData?.weekly
      : comparisonData?.monthly;

  const currentCategoryStats =
    selectedPeriod === "weekly"
      ? categoryStats?.weekly
      : categoryStats?.monthly;

  const mapItemToFormat = (item, categoryColorMap) => ({
    category: item.name.toLowerCase(),
    countTasks: item.countTasks || 0,
    completed: item.completed || 0,
    pending: item.pending || 0,
    completionPercentage: item.completionPercentage || 0,
    categoryPercentage: item.categoryPercentage || 0,
    fill: categoryColorMap[item.name.toLowerCase()] || "var(--color-others)",
  });

  const sumItems = (items, field) =>
    items.reduce((sum, item) => sum + (item[field] || 0), 0);

  const createOthersCategory = (smallCategories) => ({
    category: "others",
    countTasks: sumItems(smallCategories, "countTasks"),
    completed: sumItems(smallCategories, "completed"),
    pending: sumItems(smallCategories, "pending"),
    completionPercentage: 0,
    categoryPercentage: sumItems(smallCategories, "categoryPercentage"),
    fill: "var(--color-others)",
  });

  const formattedData = useMemo(() => {
    const data = Object.values(currentCategoryStats || {});

    if (data.length <= MAX_CATEGORIES_BEFORE_GROUPING) {
      return data.map((item) => mapItemToFormat(item, categoryColorMap));
    }

    const sortedData = [...data].sort(
      (a, b) => b.categoryPercentage - a.categoryPercentage
    );
    const topCategories = sortedData.slice(0, MAX_CATEGORIES_BEFORE_GROUPING);
    const remainingCategories = sortedData.slice(
      MAX_CATEGORIES_BEFORE_GROUPING
    );

    const formatted = topCategories.map((item) =>
      mapItemToFormat(item, categoryColorMap)
    );

    if (remainingCategories.length > 0) {
      formatted.push(createOthersCategory(remainingCategories));
    }

    return formatted;
  }, [currentCategoryStats, categoryColorMap]);

  useEffect(() => {
    setPieChartData(formattedData);
  }, [formattedData]);

  const trends = {
    changePercentage: currentComparison?.changePercentage || 0,
    changeAmount: currentComparison?.change || 0,

    projection:
      selectedPeriod === "weekly"
        ? Math.round((currentComparison?.current || 0) * 4.33)
        : Math.round((currentComparison?.current || 0) * 12),
    current: currentComparison?.current || 0,
    previous: currentComparison?.previous || 0,
  };

  const handlePeriodChange = (value) => {
    if (value) {
      setSelectedPeriod(value);
    }
  };

  const getProgressColor = (currentValue, targetValue, timeframe) => {
    const now = new Date();

    const getTimeProgress = () => {
      if (timeframe === "week") {
        const day = now.getDay();
        if (day === 0 || day === 6) return day === 0 ? 0 : 1;
        return day / 5;
      }

      if (timeframe === "month") {
        const dayOfMonth = now.getDate();
        const daysInMonth = new Date(
          now.getFullYear(),
          now.getMonth() + 1,
          0
        ).getDate();
        return dayOfMonth / daysInMonth;
      }

      return 0;
    };

    const timeProgress = getTimeProgress();
    const currentProgress = currentValue / targetValue;
    const efficiency = timeProgress > 0 ? currentProgress / timeProgress : 0;

    if (efficiency >= 1.1) return "text-green-600";
    if (efficiency >= 0.9) return "text-green-500";
    if (efficiency >= 0.7) return "text-yellow-500";
    if (efficiency >= 0.5) return "text-orange-500";
    return "text-red-600";
  };

  if (chartData && chartData?.error ) {
    return (
      <div className="text-center text-muted-foreground py-8">
        No stats to show
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 grid-cols-1 md:grid-cols-2">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <BarChart3 className="h-4 w-4 mr-2" />
              {selectedPeriod === "weekly" ? "Weekly " : "Monthly "}
              Productivity
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center justify-between gap-2">
              <span className="flex-1 min-w-0">
                Completed and pending tasks per{" "}
                {selectedPeriod === "weekly" ? "day" : "month"}
              </span>
              <ToggleGroup
                variant="outline"
                type="single"
                value={selectedPeriod}
                onValueChange={handlePeriodChange}
                className="ml-auto"
              >
                <ToggleGroupItem
                  value="weekly"
                  className="data-[state=on]:!bg-blue-500 data-[state=on]:text-white"
                >
                  Weekly
                </ToggleGroupItem>
                <ToggleGroupItem
                  value="anual"
                  className="data-[state=on]:!bg-blue-500 data-[state=on]:text-white"
                >
                  Anual
                </ToggleGroupItem>
              </ToggleGroup>
            </CardDescription>
          </CardHeader>
          <CardContent>
            {currentTotals?.total > 0 > 0 ? (
              <ChartContainer config={chartConfig}>
                <BarChart accessibilityLayer data={currentData?.data}>
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey={selectedPeriod === "weekly" ? "day" : "month"}
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <ChartTooltip content={<ChartTooltipContent hideLabel />} />
                  <ChartLegend content={<ChartLegendContent />} />
                  <Bar
                    dataKey="completed"
                    stackId="a"
                    fill="var(--color-completed)"
                    radius={[0, 0, 4, 4]}
                  />
                  <Bar
                    dataKey="pending"
                    stackId="a"
                    fill="var(--color-pending)"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No pending or completed tasks have been recorded this{" "}
                {selectedPeriod === "weekly" ? "week." : "year."}.
              </div>
            )}
          </CardContent>
          <CardFooter className="flex-col items-start gap-2 text-sm">
            <div className="flex gap-2 text-sm text-sm">
              {selectedPeriod === "weekly"
                ? "Weekly total: "
                : "Monthly total: "}
              {currentTotals?.total || 0} tasks
            </div>
            <div className="text-muted-foreground text-sm">
              Completed: {currentTotals?.completed || 0} • Pending:{" "}
              {currentTotals?.pending || 0}
            </div>
            <div className="text-muted-foreground text-sm">
              Completion rate: {completionRate} %
            </div>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <ChartPie className="h-4 w-4 mr-2" />
              Distribution by Category
            </CardTitle>
            <CardDescription className="flex flex-wrap items-center justify-between gap-2">
              Based on {selectedPeriod} data
            </CardDescription>
          </CardHeader>
          <CardContent className="flex-1 pb-0">
            {pieChartData?.length > 0 ? (
              <ChartContainer
                config={chartConfig}
                className="mx-auto aspect-square max-h-[300px]"
              >
                <PieChart>
                  <Pie
                    data={pieChartData}
                    dataKey="countTasks"
                    nameKey="category"
                    outerRadius={80}
                  >
                    <LabelList
                      dataKey="categoryPercentage"
                      className="fill-background"
                      stroke="none"
                      fontSize={12}
                      formatter={(value) => `${value}%`}
                    />
                  </Pie>
                  <ChartTooltip
                    content={
                      <ChartTooltipContent
                        nameKey="category"
                        hideLabel
                        formatter={(value, name, props) => [
                          <div
                            key="tooltip-content"
                            className="space-y-1 text-gray-600"
                          >
                            <div className="font-semibold capitalize flex items-center gap-2 text-gray-500">
                              <div
                                className="w-[11px] h-[11px] rounded-[3px] flex-shrink-0"
                                style={{ backgroundColor: props.payload.fill }}
                              />
                              {props.payload.category}
                            </div>
                            <div className="flex flex-col text-xs text-gray-500 gap-1">
                              <div>Completed: {props.payload.completed}</div>
                              <div>Pending: {props.payload.pending}</div>
                              <div>
                                % Complete: {props.payload.completionPercentage}{" "}
                                %
                              </div>
                              <div>Total: {props.payload.countTasks} tasks</div>
                            </div>
                          </div>,
                          "",
                        ]}
                      />
                    }
                  />

                  <ChartLegend
                    content={<ChartLegendContent nameKey="category" />}
                    className="flex-wrap gap-2"
                  />
                </PieChart>
              </ChartContainer>
            ) : (
              <div className="text-center text-muted-foreground py-4">
                No category data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center">
              <TrendingUp className="h-4 w-4 mr-2" />
              Completion Trends
            </CardTitle>
            <CardDescription>
              {selectedPeriod === "weekly" ? "week" : "month"} over{" "}
              {selectedPeriod === "weekly" ? "week" : "month"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">
                  This {selectedPeriod === "weekly" ? "week" : "month"}
                </span>
                <span className="text-sm  text-blue-600">
                  {trends.current} completed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">
                  Previous {selectedPeriod === "weekly" ? "week" : "month"}
                </span>
                <span className="text-sm text-muted-foreground">
                  {trends.previous} completed
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Change</span>
                <span
                  className={`text-sm ${
                    trends.changeAmount >= 0 ? "text-green-600" : "text-red-600"
                  }`}
                >
                  {trends.changeAmount >= 0 ? "+" : ""}
                  {trends.changeAmount} (
                  {trends.changePercentage >= 0 ? "+" : ""}
                  {trends.changePercentage} %)
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">
                  {selectedPeriod === "weekly" ? "Monthly" : "Annual"}{" "}
                  projection
                </span>
                <span className="text-sm text-muted-foreground">
                  ~{trends.projection} completed
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Performance Summary</CardTitle>
            <CardDescription>Based on {selectedPeriod} data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">Completion Rate</span>
                <span
                  className={`text-sm ${getProgressColor(
                    completionRate,
                    100,
                    selectedPeriod === "weekly" ? "week" : "month"
                  )}`}
                >
                  {completionRate} %
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Total Tasks</span>
                <span className="text-sm">{currentTotals?.total || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Tasks Completed</span>
                <span className="text-sm text-green-600">
                  {currentTotals?.completed || 0}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm max-w-[80%] leading-tight">
                  Avg completed per{" "}
                  {selectedPeriod === "weekly" ? "day" : "month"}
                </span>
                <span className="text-sm">
                  {selectedPeriod === "weekly"
                    ? parseFloat((currentTotals?.completed / 7).toFixed(1))
                    : parseFloat((currentTotals?.completed / 12).toFixed(1)) ||
                      0}{" "}
                  %
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Quick Stats</CardTitle>
            <CardDescription>Based on {selectedPeriod} data</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-sm">
                  Most Productive{" "}
                  {selectedPeriod === "weekly" ? "Day" : "Month"}
                </span>
                <span className="text-sm">
                  {currentTotals?.completed > 0
                    ? selectedPeriod === "weekly"
                      ? weeklyData?.data?.reduce((prev, current) =>
                          prev.completed > current.completed ? prev : current
                        )?.day
                      : monthlyData?.data?.reduce((prev, current) =>
                          prev.completed > current.completed ? prev : current
                        )?.month
                    : "N/A"}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">Peak Completed</span>
                <span className="text-sm">
                  {selectedPeriod === "weekly"
                    ? Math.max(
                        ...(weeklyData?.data?.map((d) => d.completed) || [0])
                      )
                    : Math.max(
                        ...(monthlyData?.data?.map((d) => d.completed) || [0])
                      )}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm">
                  Active {selectedPeriod === "weekly" ? "Days" : "Months"}
                </span>
                <span className="text-sm">
                  {currentData?.data?.filter((d) => d.completed > 0).length ||
                    "N/A"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default StatsProfile;
