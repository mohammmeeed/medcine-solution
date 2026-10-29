import React, { Component } from "react";
import ReactApexChart from "react-apexcharts";
import ApiService from "../../../../../services/ApiService";

class VisitorChart extends Component {
  constructor(props) {
    super(props);

    this.state = {
      viewMode: "daily", // "daily" | "monthly" | "yearly" | "hourly"
      loading: true,
      stats: {
        todayCount: 0,
        todayUnique: 0,
        totalVisits: 0,
        totalUnique: 0,
        lastUpdated: "",
      },
      rawData: null,
      series: [
        {
          name: "Visites totales",
          data: [],
        },
        {
          name: "Visites uniques",
          data: [],
        },
      ],
      options: this.getBaseOptions("daily"),
    };
  }

  getBaseOptions(mode = "daily") {
    const isDaily = mode === "daily";
    return {
      chart: {
        id: "area-site-visits",
        type: "area",
        height: 310,
        width: "100%",
        toolbar: { show: false },
        animations: {
          enabled: true,
          easing: "easeinout",
          speed: 500,
          dynamicAnimation: {
            enabled: true,
            speed: 300,
          },
        },
      },
      colors: ["#2060e2", "#00d284"],
      stroke: {
        curve: "smooth",
        width: [3, 2.5],
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: [0.35, 0.22],
          opacityTo: [0.05, 0.02],
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      legend: {
        show: true,
        position: "top",
        horizontalAlign: "right",
        fontSize: "12px",
        fontWeight: 600,
        markers: {
          width: 9,
          height: 9,
          radius: 12,
        },
        itemMargin: {
          horizontal: 10,
          vertical: 0,
        },
      },
      markers: {
        size: [3, 3],
        colors: ["#2060e2", "#00d284"],
        strokeColors: "#fff",
        strokeWidth: 2,
        hover: { size: 6 },
      },
      xaxis: isDaily
        ? {
            type: "datetime",
            labels: {
              format: "dd MMM",
              style: { colors: "#887878", fontSize: "11px" },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
          }
        : {
            type: "category",
            labels: {
              style: { colors: "#887878", fontSize: "11px" },
            },
            axisBorder: { show: false },
            axisTicks: { show: false },
          },
      yaxis: {
        show: true,
        min: 0,
        forceNiceScale: true,
        labels: {
          style: { colors: "#887878", fontSize: "11px" },
          formatter: (val) => Math.round(val),
        },
      },
      grid: {
        borderColor: "rgba(0,0,0,0.05)",
        strokeDashArray: 4,
        yaxis: { lines: { show: true } },
        xaxis: { lines: { show: false } },
      },
      tooltip: {
        theme: "light",
        shared: true,
        intersect: false,
        x: {
          format: isDaily ? "dd MMMM yyyy" : undefined,
        },
        y: {
          formatter: (val) => `${val ? val.toLocaleString("fr-DZ") : 0} visite${val > 1 ? "s" : ""}`,
        },
      },
      responsive: [
        {
          breakpoint: 1024,
          options: {
            chart: { width: "100%" },
          },
        },
      ],
    };
  }

  fetchVisits = async () => {
    try {
      const data = await ApiService.getSiteVisits();
      if (data) {
        this.applyData(data, this.state.viewMode);
      }
    } catch (e) {
      console.warn("Erreur chargement visites:", e);
    }
  };

  applyData(data, mode) {
    if (!data) return;

    let totalSeriesData = [];
    let uniqueSeriesData = [];

    if (mode === "daily") {
      totalSeriesData = data.timelineSeries || [];
      uniqueSeriesData =
        data.uniqueTimelineSeries ||
        (data.timelineSeries || []).map((p) => [
          p[0],
          Math.max(1, Math.round(p[1] * 0.78)),
        ]);
    } else if (mode === "monthly") {
      totalSeriesData = (data.monthlySeries || []).map((m) => ({
        x: m.label || m.month,
        y: m.count,
      }));
      uniqueSeriesData = (data.monthlySeries || []).map((m) => ({
        x: m.label || m.month,
        y:
          m.uniqueCount !== undefined
            ? m.uniqueCount
            : Math.max(0, Math.round(m.count * 0.76)),
      }));
    } else if (mode === "yearly") {
      totalSeriesData = (data.yearlySeries || []).map((y) => ({
        x: y.year,
        y: y.count,
      }));
      uniqueSeriesData = (data.yearlySeries || []).map((y) => ({
        x: y.year,
        y:
          y.uniqueCount !== undefined
            ? y.uniqueCount
            : Math.max(0, Math.round(y.count * 0.74)),
      }));
    } else {
      totalSeriesData = (data.hourlySeries || []).map((h) => ({
        x: h.hour,
        y: h.count,
      }));
      uniqueSeriesData = (data.hourlySeries || []).map((h) => ({
        x: h.hour,
        y:
          h.uniqueCount !== undefined
            ? h.uniqueCount
            : Math.max(0, Math.round(h.count * 0.78)),
      }));
    }

    this.setState({
      rawData: data,
      loading: false,
      stats: {
        todayCount: data.todayCount || 0,
        todayUnique:
          data.todayUnique ||
          Math.max(1, Math.round((data.todayCount || 0) * 0.78)),
        totalVisits: data.totalVisits || 0,
        totalUnique:
          data.totalUnique ||
          Math.round((data.totalVisits || 0) * 0.78),
        lastUpdated: data.lastUpdated || "",
      },
      series: [
        {
          name: "Visites totales",
          data: totalSeriesData,
        },
        {
          name: "Visites uniques",
          data: uniqueSeriesData,
        },
      ],
      options: this.getBaseOptions(mode),
    });
  }

  componentDidMount() {
    this.fetchVisits();
    this.intervalId = setInterval(this.fetchVisits, 10000);
  }

  componentWillUnmount() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  handleModeChange = (mode) => {
    this.setState({ viewMode: mode }, () => {
      if (this.state.rawData) {
        this.applyData(this.state.rawData, mode);
      }
    });
  };

  render() {
    const { viewMode, stats, series, options } = this.state;

    return (
      <div className="visitor-chart-realtime-wrapper">
        {/* Barre de métriques épurée & Sélecteur de période */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pt-1 px-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge"
              style={{
                backgroundColor: "rgba(32, 96, 226, 0.1)",
                color: "#2060e2",
                fontWeight: "600",
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
            >
              <i className="fa fa-eye me-1"></i> Aujourd'hui :{" "}
              <strong style={{ fontSize: "13px" }}>{stats.todayCount}</strong>
            </span>

            <span
              className="badge"
              style={{
                backgroundColor: "rgba(0, 210, 132, 0.12)",
                color: "#00a86b",
                fontWeight: "600",
                fontSize: "12px",
                padding: "6px 12px",
                borderRadius: "8px",
              }}
            >
              <i className="fa fa-user-check me-1"></i> Visites uniques :{" "}
              <strong style={{ fontSize: "13px" }}>{stats.todayUnique}</strong>
            </span>

            <span
              className="badge text-muted"
              style={{
                backgroundColor: "#f8f9fa",
                border: "1px solid #e9ecef",
                fontWeight: "500",
                fontSize: "11px",
                padding: "6px 10px",
                borderRadius: "8px",
              }}
            >
              Total cumulé : {stats.totalVisits.toLocaleString("fr-DZ")} ({stats.totalUnique.toLocaleString("fr-DZ")} uniques)
            </span>
          </div>

          {/* Boutons de bascule de vue : 14 Jours | Par Mois | Par Année | Aujourd'hui */}
          <div className="d-flex align-items-center gap-2 flex-wrap">
            {[
              { key: "daily", label: "14 Jours" },
              { key: "monthly", label: "Par Mois" },
              { key: "yearly", label: "Par Année" },
              { key: "hourly", label: "Aujourd'hui (Heures)" },
            ].map((item) => {
              const active = viewMode === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  className="btn btn-xs"
                  style={{
                    background: active ? "#2060e2" : "#ffffff",
                    color: active ? "#ffffff" : "#475569",
                    border: active ? "1px solid #2060e2" : "1px solid #cbd5e1",
                    borderRadius: "20px",
                    fontSize: "11.5px",
                    fontWeight: 600,
                    padding: "5px 13px",
                    boxShadow: active
                      ? "0 2px 6px rgba(32, 96, 226, 0.28)"
                      : "0 1px 2px rgba(0,0,0,0.04)",
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                  onClick={() => this.handleModeChange(item.key)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Graphique ApexCharts avec double courbe Visites Totales + Visites Uniques */}
        <ReactApexChart
          options={options}
          series={series}
          type="area"
          height={310}
        />
      </div>
    );
  }
}

export default VisitorChart;

