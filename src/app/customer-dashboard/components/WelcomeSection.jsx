import PropTypes from 'prop-types';

export default function WelcomeSection({ userName, savedDesigns, wishlistItems }) {
  return (
    <div className="bg-surface rounded-lg shadow-card p-6 border border-border">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="font-heading text-2xl font-bold text-foreground mb-2">
            Welcome back, {userName}!
          </h1>
          <p className="font-body text-muted-foreground">
            Ready to design your perfect space?
          </p>
        </div>
        <div className="flex gap-6">
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-primary">{savedDesigns}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Saved Designs</p>
          </div>
          <div className="text-center">
            <p className="font-heading text-3xl font-bold text-accent">{wishlistItems}</p>
            <p className="font-body text-sm text-muted-foreground mt-1">Wishlist Items</p>
          </div>
        </div>
      </div>
    </div>
  );
}

WelcomeSection.propTypes = {
  userName: PropTypes?.string?.isRequired,
  savedDesigns: PropTypes?.number?.isRequired,
  wishlistItems: PropTypes?.number?.isRequired,
};