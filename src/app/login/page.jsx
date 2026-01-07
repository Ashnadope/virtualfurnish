import LoginInteractive from './components/LoginInteractive';

export const metadata = {
  title: 'Login - VirtualFurnish',
  description: 'Sign in to VirtualFurnish to access your virtual room designer, furniture catalog, and personalized shopping experience at Brosas Furniture Store.',
};

export default function LoginPage() {
  const mockCredentials = {
    customer: {
      email: "customer@virtualfurnish.com",
      password: "customer123"
    },
    admin: {
      email: "admin@virtualfurnish.com",
      password: "admin123"
    }
  };

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

  return <LoginInteractive mockCredentials={mockCredentials} features={features} trustSignals={trustSignals} />;
}