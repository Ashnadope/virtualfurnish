import PropTypes from 'prop-types';
import AppImage from '@/components/ui/AppImage';

export default function ProductPerformanceTable({ products }) {
  return (
    <div className="bg-surface rounded-lg border border-border shadow-card overflow-hidden">
      <div className="p-6 border-b border-border">
        <h3 className="font-heading text-lg font-semibold text-foreground">Top Performing Products</h3>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-muted">
            <tr>
              <th className="px-6 py-3 text-left font-body text-sm font-semibold text-foreground">Product</th>
              <th className="px-6 py-3 text-left font-body text-sm font-semibold text-foreground">Category</th>
              <th className="px-6 py-3 text-right font-body text-sm font-semibold text-foreground">Units Sold</th>
              <th className="px-6 py-3 text-right font-body text-sm font-semibold text-foreground">Revenue</th>
              <th className="px-6 py-3 text-right font-body text-sm font-semibold text-foreground">Trend</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {products?.map((product) => (
              <tr key={product?.id} className="hover:bg-muted/50 transition-fast">
                <td className="px-6 py-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-md overflow-hidden bg-muted flex-shrink-0">
                      <AppImage 
                        src={product?.image} 
                        alt={product?.alt}
                        className="w-full h-full object-cover"
                      />
                    </div>
                    <span className="font-body text-sm text-foreground font-medium">{product?.name}</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span className="font-body text-sm text-muted-foreground">{product?.category}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-body text-sm text-foreground font-medium">{product?.unitsSold}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className="font-body text-sm text-foreground font-medium">₱{product?.revenue}</span>
                </td>
                <td className="px-6 py-4 text-right">
                  <span className={`inline-flex items-center gap-1 font-body text-sm font-medium ${
                    product?.trend === 'up' ? 'text-success' : 
                    product?.trend === 'down'? 'text-error' : 'text-muted-foreground'
                  }`}>
                    {product?.trend === 'up' ? '↑' : product?.trend === 'down' ? '↓' : '→'}
                    {product?.trendValue}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

ProductPerformanceTable.propTypes = {
  products: PropTypes?.arrayOf(
    PropTypes?.shape({
      id: PropTypes?.number?.isRequired,
      name: PropTypes?.string?.isRequired,
      category: PropTypes?.string?.isRequired,
      unitsSold: PropTypes?.number?.isRequired,
      revenue: PropTypes?.string?.isRequired,
      trend: PropTypes?.oneOf(['up', 'down', 'stable'])?.isRequired,
      trendValue: PropTypes?.string?.isRequired,
      image: PropTypes?.string?.isRequired,
      alt: PropTypes?.string?.isRequired
    })
  )?.isRequired
};