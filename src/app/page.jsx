import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';

export const metadata = {
  title: 'VirtualFurnish - Transform Your Space with Virtual Room Design',
  description: 'Design your dream room with VirtualFurnish. AI-powered furniture suggestions, drag-and-drop room design, and extensive furniture catalog from Brosas Furniture Store.'
};

export default function LandingPage() {
  const features = [
    {
      icon: 'SparklesIcon',
      title: 'AI-Powered Suggestions',
      description: 'Get intelligent furniture placement recommendations tailored to your room and style preferences'
    },
    {
      icon: 'CursorArrowRaysIcon',
      title: 'Drag-and-Drop Design',
      description: 'Intuitive room designer lets you arrange furniture with simple drag-and-drop controls'
    },
    {
      icon: 'SquaresPlusIcon',
      title: 'Extensive Furniture Catalog',
      description: 'Browse thousands of furniture pieces from Brosas collection to find your perfect match'
    },
    {
      icon: 'DevicePhoneMobileIcon',
      title: 'Mobile Friendly',
      description: 'Design on any device with our responsive interface optimized for all screen sizes'
    }
  ];

  const testimonials = [
    {
      name: 'Sarah Martinez',
      role: 'Homeowner',
      comment: 'VirtualFurnish helped me visualize my living room before buying. Saved me from costly mistakes!',
      rating: 5
    },
    {
      name: 'James Chen',
      role: 'Interior Designer',
      comment: 'The AI suggestions are incredibly accurate. My clients love seeing their rooms come to life.',
      rating: 5
    },
    {
      name: 'Maria Santos',
      role: 'First-time Buyer',
      comment: 'So easy to use! I designed my entire apartment in just one afternoon.',
      rating: 5
    }
  ];

  const stats = [
    { value: '50,000+', label: 'Rooms Designed' },
    { value: '15,000+', label: 'Happy Customers' },
    { value: '5,000+', label: 'Furniture Items' },
    { value: '4.9/5', label: 'Average Rating' }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary via-primary/95 to-primary/90 text-white overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-72 h-72 bg-accent rounded-full blur-3xl"></div>
          <div className="absolute bottom-20 right-10 w-96 h-96 bg-secondary rounded-full blur-3xl"></div>
        </div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Hero Content */}
            <div className="text-center lg:text-left">
              <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full mb-6">
                <Icon name="SparklesIcon" size={20} variant="solid" />
                <span className="text-sm font-medium">AI-Powered Room Design</span>
              </div>
              
              <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Transform Your Space with Virtual Furniture Design
              </h1>
              
              <p className="font-body text-lg sm:text-xl text-white/90 mb-8 max-w-2xl mx-auto lg:mx-0">
                Design your dream room before you buy. Upload your space, arrange furniture with drag-and-drop, and see your vision come to life with VirtualFurnish.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-foreground rounded-lg font-semibold text-lg hover:bg-accent/90 transition-fast shadow-lg hover:shadow-xl">
                  <Icon name="RocketLaunchIcon" size={24} variant="solid" />
                  Get Started
                </Link>
                
                <Link
                  href="/login"
                  className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-fast">
                  <Icon name="ArrowRightCircleIcon" size={24} variant="outline" />
                  Sign In
                </Link>
              </div>
              
              {/* Trust Indicators */}
              <div className="mt-8 flex flex-wrap items-center gap-6 justify-center lg:justify-start text-sm text-white/80">
                <div className="flex items-center gap-2">
                  <Icon name="CheckBadgeIcon" size={20} variant="solid" className="text-accent" />
                  <span>No Credit Card Required</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="ShieldCheckIcon" size={20} variant="solid" className="text-accent" />
                  <span>Secure & Private</span>
                </div>
                <div className="flex items-center gap-2">
                  <Icon name="UserGroupIcon" size={20} variant="solid" className="text-accent" />
                  <span>15,000+ Users</span>
                </div>
              </div>
            </div>
            
            {/* Hero Image */}
            <div className="relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl border-4 border-white/20">
                <AppImage
                  src="https://images.unsplash.com/photo-1721521912089-d1f16e3a9d96"
                  alt="Modern living room with stylish furniture arrangement showcasing VirtualFurnish design capabilities"
                  width={800}
                  height={600}
                  className="w-full h-auto"
                />
              </div>
              
              {/* Floating Stats Card */}
              <div className="absolute -bottom-6 -left-6 bg-white rounded-xl shadow-xl p-4 hidden lg:block">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center">
                    <Icon name="ChartBarIcon" size={24} variant="solid" className="text-accent" />
                  </div>
                  <div>
                    <div className="font-heading text-2xl font-bold text-foreground">50,000+</div>
                    <div className="font-body text-sm text-muted-foreground">Rooms Designed</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 bg-surface border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats?.map((stat, index) => (
              <div key={index} className="text-center">
                <div className="font-heading text-3xl lg:text-4xl font-bold text-primary mb-2">
                  {stat?.value}
                </div>
                <div className="font-body text-sm text-muted-foreground">
                  {stat?.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Everything You Need to Design Your Dream Space
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Powerful features that make room design simple, intuitive, and fun for everyone
            </p>
          </div>
          
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {features?.map((feature, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 border border-border hover:border-primary/50 transition-fast hover:shadow-lg">
                <div className="w-14 h-14 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                  <Icon name={feature?.icon} size={28} variant="solid" className="text-primary" />
                </div>
                <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                  {feature?.title}
                </h3>
                <p className="font-body text-sm text-muted-foreground">
                  {feature?.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-16 lg:py-24 bg-surface">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
              How It Works
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              Get started in three simple steps
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <div className="relative text-center">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-heading text-2xl font-bold">
                1
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Upload Your Room
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Take a photo of your space or start with a blank canvas
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="w-16 h-16 bg-secondary rounded-full flex items-center justify-center mx-auto mb-4 text-white font-heading text-2xl font-bold">
                2
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Design & Arrange
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Drag and drop furniture from our catalog with AI suggestions
              </p>
            </div>
            
            <div className="relative text-center">
              <div className="w-16 h-16 bg-accent rounded-full flex items-center justify-center mx-auto mb-4 text-foreground font-heading text-2xl font-bold">
                3
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-2">
                Shop & Purchase
              </h3>
              <p className="font-body text-sm text-muted-foreground">
                Love your design? Purchase items directly from Brosas
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-16 lg:py-24 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="font-heading text-3xl lg:text-4xl font-bold text-foreground mb-4">
              Loved by Thousands of Customers
            </h2>
            <p className="font-body text-lg text-muted-foreground max-w-2xl mx-auto">
              See what our users have to say about their VirtualFurnish experience
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {testimonials?.map((testimonial, index) => (
              <div key={index} className="bg-surface rounded-xl p-6 border border-border">
                <div className="flex gap-1 mb-4">
                  {[...Array(testimonial?.rating)]?.map((_, i) => (
                    <Icon key={i} name="StarIcon" size={20} variant="solid" className="text-accent" />
                  ))}
                </div>
                <p className="font-body text-foreground mb-4">
                  "{testimonial?.comment}"
                </p>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <Icon name="UserIcon" size={20} variant="solid" className="text-primary" />
                  </div>
                  <div>
                    <div className="font-heading font-semibold text-foreground">
                      {testimonial?.name}
                    </div>
                    <div className="font-body text-sm text-muted-foreground">
                      {testimonial?.role}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-24 bg-gradient-to-br from-primary to-primary/90 text-white">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="font-heading text-3xl lg:text-5xl font-bold mb-6">
            Ready to Transform Your Space?
          </h2>
          <p className="font-body text-lg text-white/90 mb-8 max-w-2xl mx-auto">
            Join thousands of happy customers who designed their dream rooms with VirtualFurnish. Get started today - no credit card required.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-accent text-foreground rounded-lg font-semibold text-lg hover:bg-accent/90 transition-fast shadow-lg hover:shadow-xl">
              <Icon name="RocketLaunchIcon" size={24} variant="solid" />
              Get Started Free
            </Link>
            
            <Link
              href="/login"
              className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white border-2 border-white/30 rounded-lg font-semibold text-lg hover:bg-white/20 transition-fast">
              <Icon name="ArrowRightCircleIcon" size={24} variant="outline" />
              Sign In to Your Account
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-surface border-t border-border py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-4 gap-8 mb-8">
            <div>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M3 7L10 3L17 7V15L10 19L3 15V7Z" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M10 11L14 9" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <span className="font-heading font-semibold text-lg text-foreground">VirtualFurnish</span>
              </div>
              <p className="font-body text-sm text-muted-foreground">
                Transform your space with AI-powered virtual room design from Brosas Furniture Store.
              </p>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Product</h4>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li><Link href="/login" className="hover:text-primary transition-fast">Room Designer</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-fast">Furniture Catalog</Link></li>
                <li><Link href="/login" className="hover:text-primary transition-fast">AI Suggestions</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Company</h4>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-fast">About Us</Link></li>
                <li><Link href="/" className="hover:text-primary transition-fast">Contact</Link></li>
                <li><Link href="/" className="hover:text-primary transition-fast">Careers</Link></li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-heading font-semibold text-foreground mb-4">Support</h4>
              <ul className="space-y-2 font-body text-sm text-muted-foreground">
                <li><Link href="/" className="hover:text-primary transition-fast">Help Center</Link></li>
                <li><Link href="/" className="hover:text-primary transition-fast">Privacy Policy</Link></li>
                <li><Link href="/" className="hover:text-primary transition-fast">Terms of Service</Link></li>
              </ul>
            </div>
          </div>
          
          <div className="border-t border-border pt-8 text-center font-body text-sm text-muted-foreground">
            <p>© 2026 VirtualFurnish by Brosas Furniture Store. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}