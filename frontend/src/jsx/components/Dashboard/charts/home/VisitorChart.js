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
        totalVisits: 0,
        lastUpdated: "",
      },
      rawData: null,
      series: [
        {
          name: "Visites du portail",
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
      colors: ["#2060e2"],
      stroke: {
        curve: "smooth",
        width: 3,
      },
      fill: {
        type: "gradient",
        gradient: {
          shadeIntensity: 1,
          opacityFrom: 0.5,
          opacityTo: 0.05,
          stops: [0, 90, 100],
        },
      },
      dataLabels: {
        enabled: false,
      },
      markers: {
        size: isDaily ? 3 : 3,
        colors: ["#2060e2"],
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
        x: {
          format: isDaily ? "dd MMMM yyyy" : undefined,
        },
        y: {
          formatter: (val) => `${val ? val.toLocaleString("fr-DZ") : 0} visite${val > 1 ? "s" : ""}`,
          title: {
            formatter: () => "Visites : ",
          },
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

    let seriesData = [];
    let seriesName = "Visites";

    if (mode === "daily") {
      seriesName = "Visites quotidiennes";
      seriesData = data.timelineSeries || [];
    } else if (mode === "monthly") {
      seriesName = "Visites mensuelles";
      seriesData = (data.monthlySeries || []).map((m) => ({
        x: m.label || m.month,
        y: m.count,
      }));
    } else if (mode === "yearly") {
      seriesName = "Visites annuelles";
      seriesData = (data.yearlySeries || []).map((y) => ({
        x: y.year,
        y: y.count,
      }));
    } else {
      seriesName = "Visites du jour (heures)";
      seriesData = (data.hourlySeries || []).map((h) => ({
        x: h.hour,
        y: h.count,
      }));
    }

    this.setState({
      rawData: data,
      loading: false,
      stats: {
        todayCount: data.todayCount || 0,
        totalVisits: data.totalVisits || 0,
        lastUpdated: data.lastUpdated || "",
      },
      series: [
        {
          name: seriesName,
          data: seriesData,
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
        {/* Barre de métriques épurée (sans 'En direct') & Sélecteur de période */}
        <div className="d-flex align-items-center justify-content-between flex-wrap gap-2 mb-3 pt-1 px-1">
          <div className="d-flex align-items-center gap-2 flex-wrap">
            <span
              className="badge"
              style={{
                backgroundColor: "rgba(32, 96, 226, 0.1)",
                color: "#2060e2",
                fontWeight: "600",
                fontSize: "12px",
                padding: "6px 10px",
                borderRadius: "8px",
              }}
            >
              <i className="fa fa-calendar-check-o me-1"></i> Aujourd'hui :{" "}
              <strong style={{ fontSize: "13px" }}>{stats.todayCount}</strong>
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
              Total cumulé : {stats.totalVisits.toLocaleString("fr-DZ")}
            </span>
          </div>

          {/* Boutons de bascule de vue : 14 Jours | Par Mois | Par Année | Aujourd'hui */}
          <div className="btn-group btn-group-sm" role="group">
            <button
              type="button"
              className={`btn btn-xs ${viewMode === "daily" ? "btn-primary" : "btn-light"}`}
              style={{ borderRadius: "6px 0 0 6px", fontSize: "11px", fontWeight: "600", padding: "5px 11px" }}
              onClick={() => this.handleModeChange("daily")}
            >
              14 Jours
            </button>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === "monthly" ? "btn-primary" : "btn-light"}`}
              style={{ borderRadius: "0", fontSize: "11px", fontWeight: "600", padding: "5px 11px" }}
              onClick={() => this.handleModeChange("monthly")}
            >
              Par Mois
            </button>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === "yearly" ? "btn-primary" : "btn-light"}`}
              style={{ borderRadius: "0", fontSize: "11px", fontWeight: "600", padding: "5px 11px" }}
              onClick={() => this.handleModeChange("yearly")}
            >
              Par Année
            </button>
            <button
              type="button"
              className={`btn btn-xs ${viewMode === "hourly" ? "btn-primary" : "btn-light"}`}
              style={{ borderRadius: "0 6px 6px 0", fontSize: "11px", fontWeight: "600", padding: "5px 11px" }}
              onClick={() => this.handleModeChange("hourly")}
            >
              Aujourd'hui (Heures)
            </button>
          </div>
        </div>

        {/* Graphique ApexCharts */}
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
