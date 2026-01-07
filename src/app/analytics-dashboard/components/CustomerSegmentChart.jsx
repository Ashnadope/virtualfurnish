import PropTypes from 'prop-types';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';

export default function CustomerSegmentChart({ data, title }) {
  const COLORS = ['#1E3A5F', '#D4704A', '#F4A261', '#38A169', '#D69E2E'];

  return (
    <div className="bg-surface rounded-lg p-6 border border-border shadow-card">
      <h3 className="font-heading text-lg font-semibold text-foreground mb-6">{title}</h3>
      <div className="w-full h-80" aria-label={`${title} Pie Chart`}>
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${(percent * 100)?.toFixed(0)}%`}
              outerRadius={100}
              fill="#8884d8"
              dataKey="value"
            >
              {data?.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS?.[index % COLORS?.length]} />
              ))}
            </Pie>
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
          </PieChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

CustomerSegmentChart.propTypes = {
  data: PropTypes?.arrayOf(
    PropTypes?.shape({
      name: PropTypes?.string?.isRequired,
      value: PropTypes?.number?.isRequired
    })
  )?.isRequired,
  title: PropTypes?.string?.isRequired
};