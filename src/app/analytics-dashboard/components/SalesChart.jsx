import PropTypes from 'prop-types';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export default function SalesChart({ data, title }) {
  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="w-full h-80" aria-label={`${title} Bar Chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
            <XAxis 
              dataKey="month" 
              stroke="#718096"
              style={{ fontSize: '12px', fontFamily: 'Source Sans 3' }}
            />
            <YAxis 
              stroke="#718096"
              style={{ fontSize: '12px', fontFamily: 'Source Sans 3' }}
            />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#FFFFFF', 
                border: '1px solid #E2E8F0',
                borderRadius: '8px',
                fontFamily: 'Source Sans 3'
              }}
            />
            <Legend 
              wrapperStyle={{ 
                fontFamily: 'Source Sans 3',
                fontSize: '14px'
              }}
            />
            <Bar dataKey="revenue" fill="#1E3A5F" name="Revenue (₱)" radius={[8, 8, 0, 0]} />
            <Bar dataKey="orders" fill="#D4704A" name="Orders" radius={[8, 8, 0, 0]} />
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