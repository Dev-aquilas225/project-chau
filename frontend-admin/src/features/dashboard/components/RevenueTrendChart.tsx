import { LineChart } from '@mui/x-charts/LineChart';
import { formatCurrency } from '@/lib/format';

interface RevenueTrendChartProps {
  data: { date: string; revenue: number }[];
}

export default function RevenueTrendChart({ data }: RevenueTrendChartProps) {
  return (
    <LineChart
      height={260}
      series={[
        {
          data: data.map((d) => d.revenue),
          color: '#0288d1',
          area: true,
          showMark: false,
          valueFormatter: (v) => (v == null ? '' : formatCurrency(v)),
        },
      ]}
      xAxis={[
        {
          data: data.map((d) => d.date),
          scaleType: 'point',
          valueFormatter: (d: string) => d.slice(5),
          tickLabelStyle: { fontSize: 11, fill: '#898781' },
        },
      ]}
      yAxis={[{ tickLabelStyle: { fontSize: 11, fill: '#898781' } }]}
      grid={{ horizontal: true }}
      sx={{
        '& .MuiLineElement-root': { strokeWidth: 2 },
        '& .MuiAreaElement-root': { fillOpacity: 0.1 },
        '& .MuiChartsAxis-line, & .MuiChartsAxis-tick': { stroke: '#c3c2b7' },
        '& .MuiChartsGrid-line': { stroke: '#e1e0d9' },
      }}
      margin={{ left: 60, right: 20, top: 20, bottom: 30 }}
    />
  );
}
