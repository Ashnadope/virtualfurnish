'use client';

import { useState } from 'react';
import PropTypes from 'prop-types';
import LoginForm from './LoginForm';
import SecondaryActions from './SecondaryActions';
import FeatureHighlights from './FeatureHighlights';
import TrustSignals from './TrustSignals';

export default function LoginInteractive({ mockCredentials, features, trustSignals }) {
  const [showFeatures] = useState(true);

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-6xl">
        <div className="grid lg:grid-cols-2 gap-8 items-center">
          <div className="bg-surface rounded-2xl shadow-elevated p-8 lg:p-12">
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div>
                  <h1 className="font-heading font-bold text-2xl text-foreground">VirtualFurnish</h1>
                  <p className="font-body text-sm text-muted-foreground">by Brosas Furniture Store</p>
                </div>
              </div>
              <h2 className="font-heading font-semibold text-xl text-foreground mb-2">
                Welcome Back
              </h2>
              <p className="font-body text-sm text-muted-foreground">
                Sign in to access your virtual room designer and furniture catalog
              </p>
            </div>

            <LoginForm mockCredentials={mockCredentials} />

            <div className="mt-6">
              <SecondaryActions showRegister={true} />
            </div>
          </div>

          {showFeatures && (
            <div className="hidden lg:block space-y-8">
              <FeatureHighlights features={features} />
              <TrustSignals signals={trustSignals} />
            </div>
          )}
        </div>

        <div className="mt-8 text-center">
          <p className="font-body text-sm text-muted-foreground">
            © {new Date()?.getFullYear()} Brosas Furniture Store. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
}

LoginInteractive.propTypes = {
  mockCredentials: PropTypes?.shape({
    customer: PropTypes?.shape({
      email: PropTypes?.string?.isRequired,
      password: PropTypes?.string?.isRequired
    })?.isRequired,
    admin: PropTypes?.shape({
      email: PropTypes?.string?.isRequired,
      password: PropTypes?.string?.isRequired
    })?.isRequired
  })?.isRequired,
  features: PropTypes?.arrayOf(
    PropTypes?.shape({
      icon: PropTypes?.string?.isRequired,
      title: PropTypes?.string?.isRequired,
      description: PropTypes?.string?.isRequired
    })
  )?.isRequired,
  trustSignals: PropTypes?.arrayOf(
    PropTypes?.shape({
      icon: PropTypes?.string?.isRequired,
      label: PropTypes?.string?.isRequired
    })
  )?.isRequired
};