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
    <div className="mb-6 grid grid-cols-3 gap-2 sm:grid-cols-2 sm:gap-4 lg:grid-cols-4">
      {statCards?.map((stat, index) => (
        <div
          key={index}
          className={`${getColorClasses(stat?.color)} ${index === 3 ? 'col-span-3 sm:col-span-1' : 'col-span-1'} rounded-lg border p-2.5 transition-all hover:shadow-md sm:p-4`}
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-[11px] font-medium opacity-75 sm:text-sm">{stat?.label}</p>
              <p className="mt-1 text-base font-bold sm:text-2xl">{stat?.value}</p>
            </div>
            <div className="text-xl opacity-50 sm:text-3xl">{stat?.icon}</div>
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