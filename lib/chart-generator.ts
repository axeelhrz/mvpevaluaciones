// Dynamic import wrapper to avoid build-time issues with chartjs-node-canvas

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type ChartConfiguration = any;

interface ChartJSNodeCanvasConstructor {
  new (options: { width: number; height: number; backgroundColour: string }): {
    renderToBuffer: (configuration: ChartConfiguration) => Promise<Buffer>;
  };
}

let ChartJSNodeCanvasClass: ChartJSNodeCanvasConstructor | null = null;

async function getChartJSNodeCanvas(): Promise<ChartJSNodeCanvasConstructor> {
  if (!ChartJSNodeCanvasClass) {
    const chartModule = await import('chartjs-node-canvas') as { ChartJSNodeCanvas: ChartJSNodeCanvasConstructor };
    ChartJSNodeCanvasClass = chartModule.ChartJSNodeCanvas;
  }
  return ChartJSNodeCanvasClass!;
}

const width = 800;
const height = 600;

async function getChartInstance() {
  const ChartClass = await getChartJSNodeCanvas();
  return new ChartClass({ 
    width, 
    height,
    backgroundColour: 'white'
  });
}

// ============================================
// GRÁFICA DE BARRAS
// ============================================

interface GraficaBarrasConfig {
  labels: string[];
  valores: number[];
  titulo: string;
  colorPrimario?: string;
}

export async function generarGraficaBarras(config: GraficaBarrasConfig): Promise<Buffer> {
  const { labels, valores, titulo, colorPrimario = '#6366f1' } = config;
  const chartJSNodeCanvas = await getChartInstance();

  const configuration: ChartConfiguration = {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Decil',
        data: valores,
        backgroundColor: colorPrimario,
        borderColor: colorPrimario,
        borderWidth: 1,
        borderRadius: 4,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// ============================================
// GRÁFICA DE RADAR
// ============================================

interface GraficaRadarConfig {
  labels: string[];
  valores: number[];
  titulo: string;
  colorPrimario?: string;
}

export async function generarGraficaRadar(config: GraficaRadarConfig): Promise<Buffer> {
  const { labels, valores, titulo, colorPrimario = '#8b5cf6' } = config;
  const chartJSNodeCanvas = await getChartInstance();

  const configuration: ChartConfiguration = {
    type: 'radar',
    data: {
      labels,
      datasets: [{
        label: 'Decil',
        data: valores,
        backgroundColor: `${colorPrimario}33`,
        borderColor: colorPrimario,
        borderWidth: 2,
        pointBackgroundColor: colorPrimario,
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: colorPrimario,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        }
      },
      scales: {
        r: {
          beginAtZero: true,
          max: 10,
          ticks: {
            stepSize: 2,
            font: {
              size: 11
            }
          },
          pointLabels: {
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// ============================================
// GRÁFICA DE CUADRANTES (SCATTER)
// ============================================

interface PuntoCuadrante {
  x: number;
  y: number;
  label: string;
}

interface GraficaCuadrantesConfig {
  puntos: PuntoCuadrante[];
  titulo: string;
  ejeX: string;
  ejeY: string;
  colorPrimario?: string;
}

export async function generarGraficaCuadrantes(config: GraficaCuadrantesConfig): Promise<Buffer> {
  const { puntos, titulo, ejeX, ejeY, colorPrimario = '#6366f1' } = config;
  const chartJSNodeCanvas = await getChartInstance();

  const configuration: ChartConfiguration = {
    type: 'scatter',
    data: {
      datasets: [{
        label: 'Posición',
        data: puntos.map(p => ({ x: p.x, y: p.y })),
        backgroundColor: colorPrimario,
        borderColor: colorPrimario,
        borderWidth: 2,
        pointRadius: 8,
        pointHoverRadius: 10,
        pointStyle: 'circle'
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        },
        tooltip: {
          callbacks: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            label: function(context: any) {
              const punto = puntos[context.dataIndex];
              return `${punto.label}: (${punto.x}, ${punto.y})`;
            }
          }
        }
      },
      scales: {
        x: {
          type: 'linear',
          position: 'bottom',
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          title: {
            display: true,
            text: ejeX,
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 10
          },
          grid: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: function(context: any) {
              if (context.tick.value === 5) {
                return 'rgba(0, 0, 0, 0.5)';
              }
              return 'rgba(0, 0, 0, 0.1)';
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lineWidth: function(context: any) {
              if (context.tick.value === 5) {
                return 2;
              }
              return 1;
            }
          }
        },
        y: {
          type: 'linear',
          min: 0,
          max: 10,
          ticks: {
            stepSize: 1,
            font: {
              size: 12
            }
          },
          title: {
            display: true,
            text: ejeY,
            font: {
              size: 14,
              weight: 'bold'
            },
            padding: 10
          },
          grid: {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            color: function(context: any) {
              if (context.tick.value === 5) {
                return 'rgba(0, 0, 0, 0.5)';
              }
              return 'rgba(0, 0, 0, 0.1)';
            },
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            lineWidth: function(context: any) {
              if (context.tick.value === 5) {
                return 2;
              }
              return 1;
            }
          }
        }
      }
    },
    plugins: [{
      id: 'quadrantLines',
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      afterDraw: (chart: any) => {
        const ctx = chart.ctx;
        const xAxis = chart.scales.x;
        const yAxis = chart.scales.y;

        ctx.save();
        ctx.strokeStyle = 'rgba(0, 0, 0, 0.5)';
        ctx.lineWidth = 2;

        const x5 = xAxis.getPixelForValue(5);
        ctx.beginPath();
        ctx.moveTo(x5, yAxis.top);
        ctx.lineTo(x5, yAxis.bottom);
        ctx.stroke();

        const y5 = yAxis.getPixelForValue(5);
        ctx.beginPath();
        ctx.moveTo(xAxis.left, y5);
        ctx.lineTo(xAxis.right, y5);
        ctx.stroke();

        ctx.restore();
      }
    }]
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}

// ============================================
// GRÁFICA DE LÍNEAS
// ============================================

interface GraficaLineasConfig {
  labels: string[];
  valores: number[];
  titulo: string;
  colorPrimario?: string;
}

export async function generarGraficaLineas(config: GraficaLineasConfig): Promise<Buffer> {
  const { labels, valores, titulo, colorPrimario = '#6366f1' } = config;
  const chartJSNodeCanvas = await getChartInstance();

  const configuration: ChartConfiguration = {
    type: 'line',
    data: {
      labels,
      datasets: [{
        label: 'Valor',
        data: valores,
        backgroundColor: `${colorPrimario}33`,
        borderColor: colorPrimario,
        borderWidth: 2,
        fill: true,
        tension: 0.4,
        pointBackgroundColor: colorPrimario,
        pointBorderColor: '#fff',
        pointBorderWidth: 2,
        pointRadius: 4,
        pointHoverRadius: 6
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: true,
      plugins: {
        title: {
          display: true,
          text: titulo,
          font: {
            size: 18,
            weight: 'bold'
          },
          padding: 20
        },
        legend: {
          display: false
        }
      },
      scales: {
        y: {
          beginAtZero: true,
          ticks: {
            font: {
              size: 12
            }
          },
          grid: {
            color: 'rgba(0, 0, 0, 0.1)'
          }
        },
        x: {
          ticks: {
            font: {
              size: 11
            },
            maxRotation: 45,
            minRotation: 45
          },
          grid: {
            display: false
          }
        }
      }
    }
  };

  return await chartJSNodeCanvas.renderToBuffer(configuration);
}
