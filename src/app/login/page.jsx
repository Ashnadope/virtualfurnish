'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import LoginInteractive from './components/LoginInteractive';

export default function LoginPage() {
  const router = useRouter();
  const { user, userRole, loading } = useAuth();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && user) {
      const redirectUrl = userRole === 'admin' ? '/admin-dashboard' : '/customer-dashboard';
      router.push(redirectUrl);
    }
  }, [user, userRole, loading, router]);

  const features = [
    {
      icon: "CubeIcon",
      title: "Virtual Room Designer",
      description: "Upload your room photo and arrange furniture with our intuitive drag-and-drop interface"
    },
    {
      icon: "SparklesIcon",
      title: "AI-Powered Suggestions",
      description: "Get intelligent furniture placement recommendations and color palette matching"
    },
    {
      icon: "ShoppingBagIcon",
      title: "Seamless Shopping",
      description: "Browse our catalog, add items to cart, and purchase directly from your designs"
    },
    {
      icon: "DevicePhoneMobileIcon",
      title: "Mobile Friendly",
      description: "Simple interface optimized for users with varying digital literacy levels"
    }
  ];

  const trustSignals = [
    {
      icon: "ShieldCheckIcon",
      label: "Secure Login"
    },
    {
      icon: "CheckBadgeIcon",
      label: "Verified Store"
    },
    {
      icon: "TruckIcon",
      label: "Fast Delivery"
    },
    {
      icon: "ChatBubbleLeftRightIcon",
      label: "24/7 Support"
    }
  ];

  return <LoginInteractive features={features} trustSignals={trustSignals} />;
}