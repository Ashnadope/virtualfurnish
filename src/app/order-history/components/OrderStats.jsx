'use client';

import PropTypes from 'prop-types';

export default function OrderStats({ stats }) {
  const formatCurrency = (amount) => {
    return `₱${amount?.toLocaleString('en-PH', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const statCards = [
    {
      label: 'Total Orders',
      value: stats?.total || 0,
      color: 'blue',
      icon: '📦'
    },
    {
      label: 'Delivered',
      value: stats?.delivered || 0,
      color: 'green',
      icon: '✅'
    },
    {
      label: 'In Transit',
      value: (stats?.shipped || 0) + (stats?.processing || 0),
      color: 'purple',
      icon: '🚚'
    },
    {
      label: 'Total Spent',
      value: formatCurrency(stats?.totalSpent || 0),
      color: 'gray',
      icon: '💰'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-50 text-blue-700 border-blue-200',
      green: 'bg-green-50 text-green-700 border-green-200',
      purple: 'bg-purple-50 text-purple-700 border-purple-200',
      gray: 'bg-gray-50 text-gray-700 border-gray-200'
    };
    return colors?.[color] || colors?.gray;
  };

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`${getColorClasses(stat?.color)} rounded-lg border p-4 transition-all hover:shadow-md`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium opacity-75">{stat?.label}</p>
              <p className="text-2xl font-bold mt-1">{stat?.value}</p>
            </div>
            <div className="text-3xl opacity-50">{stat?.icon}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

OrderStats.propTypes = {
  stats: PropTypes?.shape({
    total: PropTypes?.number,
    pending: PropTypes?.number,
    processing: PropTypes?.number,
    shipped: PropTypes?.number,
    delivered: PropTypes?.number,
    totalSpent: PropTypes?.number
  })?.isRequired
};