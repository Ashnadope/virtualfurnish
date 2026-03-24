import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data, title }) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="w-full h-80" aria-label={`${title} Bar Chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data} margin={{ top: 4, right: 40, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              stroke="#718096"
              style={{ fontSize: '12px', fontFamily: 'Source Sans 3' }}
            />
            {/* Left axis — Revenue */}
            <YAxis 
              yAxisId="revenue"
              stroke="#1E3A5F"
              style={{ fontSize: '11px', fontFamily: 'Source Sans 3' }}
              tickFormatter={(v) => v >= 1000 ? `₱${(v / 1000).toFixed(0)}k` : `₱${v}`}
            />
            {/* Right axis — Orders count */}
            <YAxis
              yAxisId="orders"
              orientation="right"
              stroke="#D4704A"
              style={{ fontSize: '11px', fontFamily: 'Source Sans 3' }}
              allowDecimals={false}
              tickFormatter={(v) => v}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Source Sans 3'
              }}
              formatter={(value, name) =>
                name === 'Revenue (₱)'
                  ? [`₱${Number(value).toLocaleString('en-PH')}`, name]
                  : [value, name]
              }
            />
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'Source Sans 3',
                fontSize: '14px'
              }}
            />
            <Bar yAxisId="revenue" dataKey="revenue" fill="#1E3A5F" name="Revenue (₱)" radius={[8, 8, 0, 0]} />
            <Bar yAxisId="orders" dataKey="orders" fill="#D4704A" name="Orders" radius={[8, 8, 0, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

SalesChart.propTypes = {
  data: PropTypes?.arrayOf(
    PropTypes?.shape({
      month: PropTypes?.string?.isRequired,
      revenue: PropTypes?.number?.isRequired,
      orders: PropTypes?.number?.isRequired
    })
  )?.isRequired,
  title: PropTypes?.string?.isRequired
};