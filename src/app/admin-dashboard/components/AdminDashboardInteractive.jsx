'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import MetricsCard from './MetricsCard';
import QuickActionTile from './QuickActionTile';
import ActivityItem from './ActivityItem';
import InventoryAlertItem from './InventoryAlertItem';
import OrderPreviewItem from './OrderPreviewItem';
import SalesChart from './SalesChart';
import Icon from '@/components/ui/AppIcon';

export default function AdminDashboardInteractive({ initialData }) {
  const [activeTab, setActiveTab] = useState('all');

  const filterActivities = () => {
    if (activeTab === 'all') return initialData?.recentActivities;
    return initialData?.recentActivities?.filter(activity => activity?.type === activeTab);
  };

  const filteredActivities = filterActivities();

  return (
    <div className="space-y-6">
      {/* Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {initialData?.metrics?.map((metric) => (
          <MetricsCard key={metric?.id} {...metric} />
        ))}
      </div>
      {/* Quick Actions */}
      <div>
        <h2 className="font-heading text-xl font-semibold text-foreground mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {initialData?.quickActions?.map((action) => (
            <QuickActionTile key={action?.id} {...action} />
          ))}
        </div>
      </div>
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-2">
          <div className="bg-surface rounded-lg border border-border shadow-card">
            <div className="p-6 border-b border-border">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Recent Activity</h3>
                  <p className="font-body text-sm text-muted-foreground">Latest updates and notifications</p>
                </div>
                <button className="p-2 rounded-md hover:bg-muted transition-fast" aria-label="Refresh activities">
                  <Icon name="ArrowPathIcon" size={20} variant="outline" className="text-muted-foreground" />
                </button>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setActiveTab('all')}
                  className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
                    activeTab === 'all' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setActiveTab('order')}
                  className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
                    activeTab === 'order' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Orders
                </button>
                <button
                  onClick={() => setActiveTab('inquiry')}
                  className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
                    activeTab === 'inquiry' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Inquiries
                </button>
                <button
                  onClick={() => setActiveTab('alert')}
                  className={`px-3 py-1.5 rounded-md font-body text-sm transition-fast ${
                    activeTab === 'alert' ?'bg-primary text-primary-foreground' :'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  Alerts
                </button>
              </div>
            </div>

            <div className="p-6 max-h-96 overflow-y-auto">
              {filteredActivities?.length > 0 ? (
                filteredActivities?.map((activity) => (
                  <ActivityItem key={activity?.id} {...activity} />
                ))
              ) : (
                <div className="text-center py-8">
                  <Icon name="InboxIcon" size={48} variant="outline" className="text-muted-foreground mx-auto mb-2" />
                  <p className="font-body text-sm text-muted-foreground">No activities found</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Inventory Alerts */}
        <div>
          <div className="bg-surface rounded-lg border border-border shadow-card">
            <div className="p-6 border-b border-border">
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Inventory Alerts</h3>
              <p className="font-body text-sm text-muted-foreground">Items requiring attention</p>
            </div>
            <div className="p-6 max-h-96 overflow-y-auto">
              {initialData?.inventoryAlerts?.map((product) => (
                <InventoryAlertItem key={product?.id} product={product} />
              ))}
            </div>
          </div>
        </div>
      </div>
      {/* Sales Chart */}
      <SalesChart data={initialData?.salesData} />
      {/* Pending Orders */}
      <div className="bg-surface rounded-lg border border-border shadow-card">
        <div className="p-6 border-b border-border">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading text-lg font-semibold text-foreground mb-1">Pending Orders</h3>
              <p className="font-body text-sm text-muted-foreground">Orders requiring processing</p>
            </div>
            <button className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-fast font-body text-sm font-medium">
              View All Orders
            </button>
          </div>
        </div>
        <div className="p-6">
          {initialData?.pendingOrders?.map((order) => (
            <OrderPreviewItem key={order?.id} order={order} />
          ))}
        </div>
      </div>
    </div>
  );
}

AdminDashboardInteractive.propTypes = {
  initialData: PropTypes?.shape({
    metrics: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        title: PropTypes?.string?.isRequired,
        value: PropTypes?.string?.isRequired,
        change: PropTypes?.string,
        changeType: PropTypes?.string,
        icon: PropTypes?.string?.isRequired,
        iconBg: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    quickActions: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        icon: PropTypes?.string?.isRequired,
        iconBg: PropTypes?.string?.isRequired,
        href: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    recentActivities: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        type: PropTypes?.string?.isRequired,
        title: PropTypes?.string?.isRequired,
        description: PropTypes?.string?.isRequired,
        time: PropTypes?.string?.isRequired,
        priority: PropTypes?.string,
      })
    )?.isRequired,
    inventoryAlerts: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        name: PropTypes?.string?.isRequired,
        sku: PropTypes?.string?.isRequired,
        stock: PropTypes?.number?.isRequired,
        image: PropTypes?.string?.isRequired,
        alt: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
    salesData: PropTypes?.arrayOf(
      PropTypes?.shape({
        date: PropTypes?.string?.isRequired,
        revenue: PropTypes?.number?.isRequired,
      })
    )?.isRequired,
    pendingOrders: PropTypes?.arrayOf(
      PropTypes?.shape({
        id: PropTypes?.number?.isRequired,
        orderNumber: PropTypes?.string?.isRequired,
        customerName: PropTypes?.string?.isRequired,
        items: PropTypes?.number?.isRequired,
        total: PropTypes?.number?.isRequired,
        date: PropTypes?.string?.isRequired,
        status: PropTypes?.string?.isRequired,
      })
    )?.isRequired,
  })?.isRequired,
};