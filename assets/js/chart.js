/**
 * Smart Absentee Leave Monitoring and Reporting System - Charts Manager
 * Provides standard chart configuration builders using the design system color scheme.
 */

// Global Chart configurations
const ChartColors = {
    primary: '#2563EB',
    primaryLight: 'rgba(37, 99, 235, 0.1)',
    secondary: '#22C55E',
    secondaryLight: 'rgba(34, 197, 94, 0.1)',
    warning: '#F59E0B',
    warningLight: 'rgba(245, 158, 11, 0.1)',
    danger: '#EF4444',
    dangerLight: 'rgba(239, 68, 68, 0.1)',
    info: '#3B82F6',
    gray: '#6B7280',
    gridLight: '#E5E7EB',
    gridDark: '#334155',
    textLight: '#111827',
    textDark: '#F8FAFC'
};

const ChartHelper = {
    // Determine grid color based on theme
    getGridColor() {
        const theme = document.documentElement.getAttribute("data-theme") || "light";
        return theme === "dark" ? ChartColors.gridDark : ChartColors.gridLight;
    },

    // Determine text color based on theme
    getTextColor() {
        const theme = document.documentElement.getAttribute("data-theme") || "light";
        return theme === "dark" ? ChartColors.textDark : ChartColors.textLight;
    },

    // Line Chart Builder
    createLineChart(canvasId, labels, data, datasetLabel = "Value", color = ChartColors.primary) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        // Check if chart instance already exists to destroy it
        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        return new Chart(ctx, {
            type: 'line',
            data: {
                labels: labels,
                datasets: [{
                    label: datasetLabel,
                    data: data,
                    borderColor: color,
                    backgroundColor: color === ChartColors.primary ? ChartColors.primaryLight : 'rgba(0,0,0,0.05)',
                    borderWidth: 3,
                    fill: true,
                    tension: 0.35,
                    pointBackgroundColor: color,
                    pointHoverRadius: 7
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        display: false
                    },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 10,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)',
                        titleFont: { family: 'Inter', size: 13, weight: 'bold' },
                        bodyFont: { family: 'Inter', size: 12 }
                    }
                },
                scales: {
                    y: {
                        grid: {
                            color: this.getGridColor(),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 11 }
                        }
                    },
                    x: {
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                }
            }
        });
    },

    // Bar Chart Builder
    createBarChart(canvasId, labels, datasets, stack = false) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        // format datasets if raw data array is passed instead of standard ChartJS datasets
        let formattedDatasets = datasets;
        if (Array.isArray(datasets) && typeof datasets[0] === 'number') {
            formattedDatasets = [{
                label: 'Absentees',
                data: datasets,
                backgroundColor: ChartColors.primary,
                borderRadius: 8
            }];
        } else {
            // Apply standard design token styles
            formattedDatasets = datasets.map((d, i) => ({
                borderRadius: 8,
                backgroundColor: [ChartColors.primary, ChartColors.secondary, ChartColors.warning, ChartColors.danger][i % 4],
                ...d
            }));
        }

        return new Chart(ctx, {
            type: 'bar',
            data: {
                labels: labels,
                datasets: formattedDatasets
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'top',
                        labels: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 12, weight: '500' }
                        }
                    },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 10,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)'
                    }
                },
                scales: {
                    y: {
                        stacked: stack,
                        grid: {
                            color: this.getGridColor(),
                            drawBorder: false
                        },
                        ticks: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 11 }
                        }
                    },
                    x: {
                        stacked: stack,
                        grid: {
                            display: false
                        },
                        ticks: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 11 }
                        }
                    }
                }
            }
        });
    },

    // Pie Chart Builder
    createPieChart(canvasId, labels, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        return new Chart(ctx, {
            type: 'pie',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        ChartColors.primary,
                        ChartColors.secondary,
                        ChartColors.warning,
                        ChartColors.danger
                    ],
                    borderWidth: 2,
                    borderColor: 'transparent'
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: {
                        position: 'right',
                        labels: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 12, weight: '500' },
                            padding: 16
                        }
                    },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 10,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)'
                    }
                }
            }
        });
    },

    // Doughnut Chart Builder
    createDoughnutChart(canvasId, labels, data) {
        const ctx = document.getElementById(canvasId);
        if (!ctx) return null;

        const existingChart = Chart.getChart(ctx);
        if (existingChart) existingChart.destroy();

        return new Chart(ctx, {
            type: 'doughnut',
            data: {
                labels: labels,
                datasets: [{
                    data: data,
                    backgroundColor: [
                        ChartColors.primary,
                        ChartColors.secondary,
                        ChartColors.warning,
                        ChartColors.danger
                    ],
                    borderWidth: 4,
                    borderColor: 'transparent',
                    hoverOffset: 6
                }]
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                cutout: '70%',
                plugins: {
                    legend: {
                        position: 'bottom',
                        labels: {
                            color: this.getTextColor(),
                            font: { family: 'Inter', size: 12, weight: '500' },
                            padding: 16
                        }
                    },
                    tooltip: {
                        padding: 12,
                        cornerRadius: 10,
                        backgroundColor: 'rgba(15, 23, 42, 0.9)'
                    }
                }
            }
        });
    }
};

window.ChartHelper = ChartHelper;
