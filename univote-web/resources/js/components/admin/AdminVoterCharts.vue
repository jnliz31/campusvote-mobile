<template>
    <div class="voter-charts-card">
        <div class="charts-header">
            <div class="title-group">
                <span class="charts-kicker">Interactive Analytics</span>
                <h3 class="charts-title">Voter Participation & Demographic Visualizer</h3>
                <p class="charts-subtitle">Dynamically inspect voter participation and sex distribution across organizations.</p>
            </div>

            <div class="controls-toolbar">
                <!-- Chart Type Selector -->
                <div class="segmented-control" role="group" aria-label="Chart Type Selection">
                    <button
                        type="button"
                        class="seg-btn"
                        :class="{ active: chartType === 'bar' }"
                        @click="chartType = 'bar'"
                        title="Bar Chart"
                    >
                        <svg class="seg-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M2 11h3v7H2v-7zm6-5h3v12H8V6zm6-4h3v16h-3V2z" />
                        </svg>
                        <span>Bar</span>
                    </button>
                    <button
                        type="button"
                        class="seg-btn"
                        :class="{ active: chartType === 'doughnut' }"
                        @click="chartType = 'doughnut'"
                        title="Doughnut Chart"
                    >
                        <svg class="seg-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm0-5a3 3 0 100-6 3 3 0 000 6z" clip-rule="evenodd" />
                        </svg>
                        <span>Doughnut</span>
                    </button>
                    <button
                        type="button"
                        class="seg-btn"
                        :class="{ active: chartType === 'pie' }"
                        @click="chartType = 'pie'"
                        title="Pie Chart"
                    >
                        <svg class="seg-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path d="M10 2a8 8 0 108 8h-8V2z" />
                            <path d="M12 2.25A8.014 8.014 0 0117.75 8H12V2.25z" />
                        </svg>
                        <span>Pie</span>
                    </button>
                    <button
                        type="button"
                        class="seg-btn"
                        :class="{ active: chartType === 'line' }"
                        @click="chartType = 'line'"
                        title="Line Chart"
                    >
                        <svg class="seg-icon" viewBox="0 0 20 20" fill="currentColor">
                            <path fill-rule="evenodd" d="M3 3a1 1 0 011 1v12h13a1 1 0 110 2H3a1 1 0 01-1-1V4a1 1 0 011-1zm13.707 4.293a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0L9 10.414l-2.293 2.293a1 1 0 01-1.414-1.414l3-3a1 1 0 011.414 0L12 10.586l3.293-3.293a1 1 0 011.414 0z" clip-rule="evenodd" />
                        </svg>
                        <span>Line</span>
                    </button>
                </div>

                <!-- Metric Mode Selector -->
                <div class="metric-filter">
                    <label for="metricModeSelect" class="filter-label">Display Mode:</label>
                    <select id="metricModeSelect" v-model="metricMode" class="form-select">
                        <option value="both">All Metrics (Voter Status & Sex)</option>
                        <option value="participation">Participation Only (Total / Voted / Not Voted)</option>
                        <option value="demographics">Sex Breakdown (Male / Female / Other)</option>
                    </select>
                </div>

                <!-- Org Focus Selector (especially helpful for Pie & Doughnut) -->
                <div v-if="chartType === 'pie' || chartType === 'doughnut'" class="org-filter">
                    <label for="focusOrgSelect" class="filter-label">Organization:</label>
                    <select id="focusOrgSelect" v-model="selectedOrgId" class="form-select">
                        <option value="all">All Organizations (Aggregated)</option>
                        <option v-for="org in validOrganizations" :key="org.id ?? 'unassigned'" :value="org.id ?? 'unassigned'">
                            {{ org.name }} ({{ org.code }})
                        </option>
                    </select>
                </div>
            </div>
        </div>

        <!-- Dynamic Chart Display Canvas / SVG -->
        <div class="chart-stage">
            <div v-if="!validOrganizations.length" class="empty-chart">
                <p>No organization voter data available to plot.</p>
            </div>

            <!-- 1. BAR CHART -->
            <div v-else-if="chartType === 'bar'" class="chart-wrapper">
                <svg
                    class="chart-svg"
                    :viewBox="`0 0 ${barChartWidth} ${barChartHeight}`"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <!-- Gridlines & Y-Axis -->
                    <g class="grid-lines">
                        <line
                            v-for="tick in barYAxisTicks"
                            :key="tick.value"
                            :x1="margin.left"
                            :y1="tick.y"
                            :x2="barChartWidth - margin.right"
                            :y2="tick.y"
                            stroke="#e9ecef"
                            stroke-dasharray="3,3"
                        />
                        <text
                            v-for="tick in barYAxisTicks"
                            :key="'lbl-' + tick.value"
                            :x="margin.left - 10"
                            :y="tick.y + 4"
                            text-anchor="end"
                            class="axis-text"
                        >
                            {{ tick.value }}
                        </text>
                    </g>

                    <!-- Grouped Bars per Organization -->
                    <g v-for="(group, gIdx) in barGroups" :key="group.org.id ?? gIdx" class="bar-group">
                        <rect
                            v-for="bar in group.bars"
                            :key="bar.key"
                            :x="bar.x"
                            :y="bar.y"
                            :width="bar.width"
                            :height="bar.height"
                            :fill="bar.color"
                            rx="3"
                            class="bar-rect"
                            @mouseenter="setHoverTooltip($event, `${group.org.name} (${group.org.code})`, bar.label, bar.value)"
                            @mouseleave="clearTooltip"
                        />
                        <!-- X-Axis Organization Label -->
                        <text
                            :x="group.centerX"
                            :y="barChartHeight - 20"
                            text-anchor="middle"
                            class="org-axis-label"
                        >
                            {{ group.org.code }}
                        </text>
                    </g>

                    <!-- Baseline Axis -->
                    <line
                        :x1="margin.left"
                        :y1="barBaselineY"
                        :x2="barChartWidth - margin.right"
                        :y2="barBaselineY"
                        stroke="#cdd8cf"
                        stroke-width="1.5"
                    />
                </svg>
            </div>

            <!-- 2. DOUGHNUT / PIE CHART -->
            <div v-else-if="chartType === 'doughnut' || chartType === 'pie'" class="circular-chart-layout">
                <div class="pie-svg-container">
                    <svg
                        class="circular-svg"
                        viewBox="-160 -160 320 320"
                    >
                        <g v-if="slices.length > 0">
                            <path
                                v-for="slice in slices"
                                :key="slice.key"
                                :d="slice.pathD"
                                :fill="slice.color"
                                class="pie-slice"
                                @mouseenter="setHoverTooltip($event, slice.groupName, slice.label, slice.value, slice.percentage)"
                                @mouseleave="clearTooltip"
                            />
                        </g>
                        <!-- Center text for Doughnut Chart -->
                        <g v-if="chartType === 'doughnut'" class="doughnut-center-info">
                            <circle cx="0" cy="0" r="68" fill="#ffffff" />
                            <text y="-8" text-anchor="middle" class="donut-center-val">{{ currentTotalFocusCount }}</text>
                            <text y="14" text-anchor="middle" class="donut-center-lbl">Total Voters</text>
                        </g>
                    </svg>
                </div>

                <div class="slices-breakdown">
                    <h4 class="breakdown-title">{{ currentFocusName }}</h4>
                    <p class="breakdown-meta">
                        Registered Voters: <strong>{{ currentTotalFocusCount }}</strong>
                        <span v-if="currentFocusTurnout !== null"> · Turnout: <strong>{{ currentFocusTurnout }}%</strong></span>
                    </p>
                    <div class="slices-list">
                        <div
                            v-for="slice in slices"
                            :key="slice.key"
                            class="slice-item"
                        >
                            <span class="slice-dot" :style="{ backgroundColor: slice.color }"></span>
                            <div class="slice-texts">
                                <span class="slice-name">{{ slice.label }}</span>
                                <span class="slice-stats"><strong>{{ slice.value }}</strong> ({{ slice.percentage }}%)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- 3. LINE CHART -->
            <div v-else-if="chartType === 'line'" class="chart-wrapper">
                <svg
                    class="chart-svg"
                    :viewBox="`0 0 ${barChartWidth} ${barChartHeight}`"
                    preserveAspectRatio="xMidYMid meet"
                >
                    <!-- Gridlines & Y-Axis -->
                    <g class="grid-lines">
                        <line
                            v-for="tick in barYAxisTicks"
                            :key="tick.value"
                            :x1="margin.left"
                            :y1="tick.y"
                            :x2="barChartWidth - margin.right"
                            :y2="tick.y"
                            stroke="#e9ecef"
                            stroke-dasharray="3,3"
                        />
                        <text
                            v-for="tick in barYAxisTicks"
                            :key="'lbl-' + tick.value"
                            :x="margin.left - 10"
                            :y="tick.y + 4"
                            text-anchor="end"
                            class="axis-text"
                        >
                            {{ tick.value }}
                        </text>
                    </g>

                    <!-- Baseline Axis -->
                    <line
                        :x1="margin.left"
                        :y1="barBaselineY"
                        :x2="barChartWidth - margin.right"
                        :y2="barBaselineY"
                        stroke="#cdd8cf"
                        stroke-width="1.5"
                    />

                    <!-- Line Series Paths & Dots -->
                    <g v-for="series in lineSeriesList" :key="series.key" class="line-series">
                        <path
                            :d="series.pathD"
                            fill="none"
                            :stroke="series.color"
                            stroke-width="3"
                            stroke-linejoin="round"
                            stroke-linecap="round"
                        />
                        <!-- Dots -->
                        <circle
                            v-for="pt in series.points"
                            :key="pt.orgCode"
                            :cx="pt.x"
                            :cy="pt.y"
                            r="5"
                            :fill="series.color"
                            stroke="#ffffff"
                            stroke-width="2"
                            class="line-point"
                            @mouseenter="setHoverTooltip($event, `${pt.orgName} (${pt.orgCode})`, series.label, pt.value)"
                            @mouseleave="clearTooltip"
                        />
                    </g>

                    <!-- X-Axis Labels -->
                    <text
                        v-for="orgPt in lineXLabels"
                        :key="orgPt.code"
                        :x="orgPt.x"
                        :y="barChartHeight - 20"
                        text-anchor="middle"
                        class="org-axis-label"
                    >
                        {{ orgPt.code }}
                    </text>
                </svg>
            </div>
        </div>

        <!-- Universal Legend -->
        <footer class="chart-legend" aria-label="Chart Series Legend">
            <div
                v-for="item in visibleLegendItems"
                :key="item.key"
                class="legend-item"
            >
                <span class="legend-color" :style="{ backgroundColor: item.color }"></span>
                <span class="legend-label">{{ item.label }}</span>
            </div>
        </footer>

        <!-- Floating Tooltip -->
        <div
            v-if="tooltip.visible"
            class="chart-tooltip"
            :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }"
        >
            <strong class="tooltip-title">{{ tooltip.title }}</strong>
            <div class="tooltip-body">
                <span class="tooltip-metric">{{ tooltip.metric }}:</span>
                <span class="tooltip-val">{{ tooltip.value }}</span>
                <span v-if="tooltip.percentage" class="tooltip-pct">({{ tooltip.percentage }}%)</span>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    name: "AdminVoterCharts",
    props: {
        organizationStats: {
            type: Array,
            default: () => [],
        },
    },
    data() {
        return {
            chartType: "bar", // bar, doughnut, pie, line
            metricMode: "both", // both, participation, demographics
            selectedOrgId: "all",
            margin: { top: 30, right: 30, bottom: 50, left: 50 },
            barChartWidth: 780,
            barChartHeight: 330,
            tooltip: {
                visible: false,
                x: 0,
                y: 0,
                title: "",
                metric: "",
                value: 0,
                percentage: null,
            },
            palette: {
                total_voters: { key: "total_voters", label: "Total Voters", color: "#146c3a" },
                voted: { key: "voted", label: "Voted", color: "#10b981" },
                not_voted: { key: "not_voted", label: "Not Voted", color: "#f59e0b" },
                male_voters: { key: "male_voters", label: "Male Voters", color: "#2563eb" },
                female_voters: { key: "female_voters", label: "Female Voters", color: "#db2777" },
                other_voters: { key: "other_voters", label: "Other Voters", color: "#8b5cf6" },
            },
        };
    },
    computed: {
        validOrganizations() {
            return this.organizationStats || [];
        },
        activeSeriesKeys() {
            if (this.metricMode === "participation") {
                return ["total_voters", "voted", "not_voted"];
            }
            if (this.metricMode === "demographics") {
                return ["male_voters", "female_voters", "other_voters"];
            }
            // both
            return ["total_voters", "voted", "not_voted", "male_voters", "female_voters", "other_voters"];
        },
        visibleLegendItems() {
            return this.activeSeriesKeys.map((k) => this.palette[k]);
        },
        barBaselineY() {
            return this.barChartHeight - this.margin.bottom;
        },
        barMaxVal() {
            let max = 5;
            for (const org of this.validOrganizations) {
                for (const key of this.activeSeriesKeys) {
                    if ((org[key] || 0) > max) {
                        max = org[key] || 0;
                    }
                }
            }
            // Round up to nice number
            return Math.ceil(max * 1.15) || 5;
        },
        barYAxisTicks() {
            const ticks = [];
            const count = 5;
            const step = this.barMaxVal / count;
            const availableHeight = this.barBaselineY - this.margin.top;

            for (let i = 0; i <= count; i++) {
                const val = Math.round(i * step);
                const y = this.barBaselineY - (val / this.barMaxVal) * availableHeight;
                ticks.push({ value: val, y });
            }
            return ticks;
        },
        barGroups() {
            const orgs = this.validOrganizations;
            if (!orgs.length) return [];

            const chartAreaWidth = this.barChartWidth - this.margin.left - this.margin.right;
            const groupWidth = chartAreaWidth / orgs.length;
            const seriesKeys = this.activeSeriesKeys;
            const barWidth = Math.max(6, Math.min(22, (groupWidth * 0.72) / seriesKeys.length));
            const availableHeight = this.barBaselineY - this.margin.top;

            return orgs.map((org, index) => {
                const groupStartX = this.margin.left + index * groupWidth;
                const centerX = groupStartX + groupWidth / 2;
                const totalBarsWidth = seriesKeys.length * barWidth;
                const startX = centerX - totalBarsWidth / 2;

                const bars = seriesKeys.map((key, sIdx) => {
                    const val = org[key] || 0;
                    const height = (val / this.barMaxVal) * availableHeight;
                    const x = startX + sIdx * barWidth;
                    const y = this.barBaselineY - height;
                    return {
                        key,
                        x,
                        y,
                        width: Math.max(2, barWidth - 2),
                        height,
                        color: this.palette[key].color,
                        label: this.palette[key].label,
                        value: val,
                    };
                });

                return {
                    org,
                    centerX,
                    bars,
                };
            });
        },
        // Circular / Pie / Doughnut data calculation
        focusedOrgData() {
            if (this.selectedOrgId === "all") {
                const agg = {
                    name: "All Organizations",
                    code: "ALL",
                    total_voters: 0,
                    voted: 0,
                    not_voted: 0,
                    male_voters: 0,
                    female_voters: 0,
                    other_voters: 0,
                };
                for (const org of this.validOrganizations) {
                    agg.total_voters += org.total_voters || 0;
                    agg.voted += org.voted || 0;
                    agg.not_voted += org.not_voted || 0;
                    agg.male_voters += org.male_voters || 0;
                    agg.female_voters += org.female_voters || 0;
                    agg.other_voters += org.other_voters || 0;
                }
                return agg;
            }

            return (
                this.validOrganizations.find(
                    (o) => (o.id ?? "unassigned") === this.selectedOrgId,
                ) || {
                    name: "Unknown",
                    code: "N/A",
                    total_voters: 0,
                    voted: 0,
                    not_voted: 0,
                    male_voters: 0,
                    female_voters: 0,
                    other_voters: 0,
                }
            );
        },
        currentFocusName() {
            return this.focusedOrgData.name;
        },
        currentTotalFocusCount() {
            return this.focusedOrgData.total_voters || 0;
        },
        currentFocusTurnout() {
            const tot = this.focusedOrgData.total_voters || 0;
            if (!tot) return 0;
            return Math.round(((this.focusedOrgData.voted || 0) / tot) * 100);
        },
        slices() {
            const data = this.focusedOrgData;
            let seriesItems = [];

            if (this.metricMode === "demographics") {
                seriesItems = [
                    { key: "male_voters", label: "Male Voters", val: data.male_voters || 0, color: this.palette.male_voters.color },
                    { key: "female_voters", label: "Female Voters", val: data.female_voters || 0, color: this.palette.female_voters.color },
                    { key: "other_voters", label: "Other Voters", val: data.other_voters || 0, color: this.palette.other_voters.color },
                ];
            } else {
                // Participation breakdown (or both)
                seriesItems = [
                    { key: "voted", label: "Voted", val: data.voted || 0, color: this.palette.voted.color },
                    { key: "not_voted", label: "Not Voted", val: data.not_voted || 0, color: this.palette.not_voted.color },
                ];
                if (this.metricMode === "both") {
                    seriesItems.push(
                        { key: "male_voters", label: "Male Voters", val: data.male_voters || 0, color: this.palette.male_voters.color },
                        { key: "female_voters", label: "Female Voters", val: data.female_voters || 0, color: this.palette.female_voters.color },
                        { key: "other_voters", label: "Other Voters", val: data.other_voters || 0, color: this.palette.other_voters.color },
                    );
                }
            }

            const total = seriesItems.reduce((acc, s) => acc + s.val, 0);
            if (total === 0) return [];

            const isDonut = this.chartType === "doughnut";
            const outerR = 140;
            const innerR = isDonut ? 75 : 0;

            let currentAngle = -Math.PI / 2;
            const result = [];

            for (const item of seriesItems) {
                if (item.val <= 0) continue;
                const sliceAngle = (item.val / total) * 2 * Math.PI;
                const endAngle = currentAngle + sliceAngle;

                const x1 = Math.cos(currentAngle) * outerR;
                const y1 = Math.sin(currentAngle) * outerR;
                const x2 = Math.cos(endAngle) * outerR;
                const y2 = Math.sin(endAngle) * outerR;

                const largeArc = sliceAngle > Math.PI ? 1 : 0;

                let pathD = "";
                if (isDonut) {
                    const ix1 = Math.cos(endAngle) * innerR;
                    const iy1 = Math.sin(endAngle) * innerR;
                    const ix2 = Math.cos(currentAngle) * innerR;
                    const iy2 = Math.sin(currentAngle) * innerR;

                    pathD = `M ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} L ${ix1} ${iy1} A ${innerR} ${innerR} 0 ${largeArc} 0 ${ix2} ${iy2} Z`;
                } else {
                    pathD = `M 0 0 L ${x1} ${y1} A ${outerR} ${outerR} 0 ${largeArc} 1 ${x2} ${y2} Z`;
                }

                result.push({
                    key: item.key,
                    label: item.label,
                    value: item.val,
                    groupName: data.name,
                    percentage: Math.round((item.val / total) * 100),
                    color: item.color,
                    pathD,
                });

                currentAngle = endAngle;
            }

            return result;
        },
        // Line series calculations
        lineSeriesList() {
            const orgs = this.validOrganizations;
            if (!orgs.length) return [];

            const chartAreaWidth = this.barChartWidth - this.margin.left - this.margin.right;
            const stepX = orgs.length > 1 ? chartAreaWidth / (orgs.length - 1) : chartAreaWidth / 2;
            const availableHeight = this.barBaselineY - this.margin.top;

            return this.activeSeriesKeys.map((key) => {
                const points = orgs.map((org, idx) => {
                    const x = orgs.length > 1 ? this.margin.left + idx * stepX : this.margin.left + chartAreaWidth / 2;
                    const val = org[key] || 0;
                    const y = this.barBaselineY - (val / this.barMaxVal) * availableHeight;
                    return {
                        x,
                        y,
                        value: val,
                        orgName: org.name,
                        orgCode: org.code,
                    };
                });

                const pathD = points.reduce((d, pt, i) => `${d} ${i === 0 ? "M" : "L"} ${pt.x} ${pt.y}`, "");

                return {
                    key,
                    label: this.palette[key].label,
                    color: this.palette[key].color,
                    points,
                    pathD,
                };
            });
        },
        lineXLabels() {
            const orgs = this.validOrganizations;
            if (!orgs.length) return [];

            const chartAreaWidth = this.barChartWidth - this.margin.left - this.margin.right;
            const stepX = orgs.length > 1 ? chartAreaWidth / (orgs.length - 1) : chartAreaWidth / 2;

            return orgs.map((org, idx) => ({
                code: org.code,
                x: orgs.length > 1 ? this.margin.left + idx * stepX : this.margin.left + chartAreaWidth / 2,
            }));
        },
    },
    methods: {
        setHoverTooltip(event, title, metric, value, percentage = null) {
            const rect = event.target.getBoundingClientRect();
            this.tooltip = {
                visible: true,
                x: rect.left + window.scrollX + rect.width / 2,
                y: rect.top + window.scrollY - 10,
                title,
                metric,
                value,
                percentage,
            };
        },
        clearTooltip() {
            this.tooltip.visible = false;
        },
    },
};
</script>

<style scoped>
.voter-charts-card {
    background: #ffffff;
    border: 1px solid #dce5de;
    border-radius: 12px;
    padding: 24px;
    margin-bottom: 24px;
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.04);
}

.charts-header {
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    flex-wrap: wrap;
    gap: 16px;
    margin-bottom: 24px;
    border-bottom: 1px solid #edf1ed;
    padding-bottom: 18px;
}

.charts-kicker {
    display: inline-block;
    color: #146c3a;
    font-size: 11px;
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 4px;
}

.charts-title {
    margin: 0 0 4px 0;
    font-size: 20px;
    font-weight: 700;
    color: #17231d;
}

.charts-subtitle {
    margin: 0;
    color: #68756d;
    font-size: 13px;
}

.controls-toolbar {
    display: flex;
    align-items: center;
    flex-wrap: wrap;
    gap: 12px;
}

/* Segmented Control for Chart Types */
.segmented-control {
    display: inline-flex;
    background: #f1f5f2;
    border-radius: 8px;
    padding: 3px;
    border: 1px solid #dce5de;
}

.seg-btn {
    border: none;
    background: transparent;
    color: #43544b;
    padding: 6px 12px;
    font-size: 12px;
    font-weight: 700;
    border-radius: 6px;
    cursor: pointer;
    display: inline-flex;
    align-items: center;
    gap: 6px;
    transition: all 0.15s ease;
}

.seg-btn:hover {
    color: #146c3a;
}

.seg-btn.active {
    background: #ffffff;
    color: #146c3a;
    box-shadow: 0 1px 4px rgba(0, 0, 0, 0.08);
}

.seg-icon {
    width: 14px;
    height: 14px;
}

/* Metric and Org Filters */
.metric-filter,
.org-filter {
    display: flex;
    align-items: center;
    gap: 6px;
}

.filter-label {
    font-size: 12px;
    font-weight: 600;
    color: #68756d;
    white-space: nowrap;
}

.form-select {
    padding: 6px 10px;
    font-size: 12px;
    font-weight: 600;
    border: 1px solid #cdd8cf;
    border-radius: 6px;
    background: #ffffff;
    color: #17231d;
    outline: none;
    cursor: pointer;
}

.form-select:focus {
    border-color: #146c3a;
    box-shadow: 0 0 0 2px rgba(20, 108, 58, 0.15);
}

/* Chart Canvas / SVG wrapper */
.chart-stage {
    position: relative;
    min-height: 330px;
    display: flex;
    align-items: center;
    justify-content: center;
    margin-bottom: 20px;
}

.chart-wrapper {
    width: 100%;
    overflow-x: auto;
}

.chart-svg {
    width: 100%;
    height: auto;
    max-height: 330px;
    display: block;
}

.axis-text {
    font-size: 11px;
    fill: #8a968f;
    font-weight: 500;
}

.org-axis-label {
    font-size: 12px;
    fill: #294033;
    font-weight: 700;
}

.bar-rect {
    transition: transform 0.2s ease, opacity 0.2s ease;
    cursor: pointer;
}

.bar-rect:hover {
    opacity: 0.85;
    filter: brightness(1.1);
}

.line-point {
    cursor: pointer;
    transition: r 0.15s ease;
}

.line-point:hover {
    r: 8;
}

/* Circular / Pie / Doughnut layout */
.circular-chart-layout {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 30px;
}

.pie-svg-container {
    width: 320px;
    height: 320px;
    flex-shrink: 0;
}

.circular-svg {
    width: 100%;
    height: 100%;
    overflow: visible;
}

.pie-slice {
    stroke: #ffffff;
    stroke-width: 2px;
    cursor: pointer;
    transition: transform 0.2s ease, filter 0.2s ease;
}

.pie-slice:hover {
    filter: brightness(1.08);
}

.donut-center-val {
    font-size: 26px;
    font-weight: 800;
    fill: #146c3a;
}

.donut-center-lbl {
    font-size: 11px;
    font-weight: 700;
    fill: #68756d;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.slices-breakdown {
    flex: 1;
    min-width: 260px;
    max-width: 420px;
}

.breakdown-title {
    margin: 0 0 4px 0;
    font-size: 18px;
    font-weight: 700;
    color: #17231d;
}

.breakdown-meta {
    margin: 0 0 16px 0;
    font-size: 13px;
    color: #68756d;
}

.slices-list {
    display: grid;
    gap: 10px;
}

.slice-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 8px 12px;
    background: #f8faf8;
    border-radius: 8px;
    border: 1px solid #edf1ed;
}

.slice-dot {
    width: 12px;
    height: 12px;
    border-radius: 3px;
    flex-shrink: 0;
}

.slice-texts {
    display: flex;
    justify-content: space-between;
    width: 100%;
    font-size: 13px;
}

.slice-name {
    color: #43544b;
    font-weight: 600;
}

.slice-stats {
    color: #17231d;
}

/* Legend */
.chart-legend {
    display: flex;
    flex-wrap: wrap;
    gap: 16px;
    justify-content: center;
    padding-top: 14px;
    border-top: 1px solid #edf1ed;
}

.legend-item {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    font-size: 12px;
    font-weight: 600;
    color: #43544b;
}

.legend-color {
    width: 10px;
    height: 10px;
    border-radius: 2px;
}

/* Floating Tooltip */
.chart-tooltip {
    position: fixed;
    transform: translate(-50%, -100%);
    background: #17231d;
    color: #ffffff;
    padding: 8px 12px;
    border-radius: 6px;
    font-size: 12px;
    pointer-events: none;
    z-index: 1000;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.18);
}

.tooltip-title {
    display: block;
    margin-bottom: 2px;
    font-size: 11px;
    color: #c7eed2;
}

.tooltip-body {
    display: flex;
    align-items: center;
    gap: 5px;
}

.tooltip-metric {
    color: #d1d5db;
}

.tooltip-val {
    font-weight: 700;
}

.tooltip-pct {
    color: #a7f3d0;
}

.empty-chart {
    text-align: center;
    color: #68756d;
    font-size: 14px;
}

@media (max-width: 768px) {
    .charts-header {
        flex-direction: column;
    }
    .controls-toolbar {
        width: 100%;
    }
    .segmented-control {
        width: 100%;
        justify-content: space-between;
    }
}
</style>
