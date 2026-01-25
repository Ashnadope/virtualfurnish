'use client';

import SignupForm from './SignupForm';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';

export default function SignupInteractive() {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-surface rounded-2xl shadow-elevated p-8 lg:p-12">
          <div className="mb-8 text-center">
            <div className="inline-flex items-center justify-center gap-3 mb-6">
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
              Create your Account
            </h2>
            <p className="font-body text-sm text-muted-foreground">
              Join to start designing your dream room.
            </p>
          </div>

          <SignupForm />

          <div className="mt-6 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground font-body">
                Already have an account?{' '}
                <Link href="/login" className="font-semibold text-primary hover:text-primary/80 transition-fast">
                    Sign In
                </Link>
            </p>
          </div>
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