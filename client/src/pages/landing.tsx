import { useAuth } from "@/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Chatbot } from "@/components/ui/chatbot";
import { Truck, Shield, Clock, DollarSign, MapPin, CheckCircle, Building2, Users, Menu, X } from "lucide-react";
import { useEffect, useState } from "react";
import { useLocation, Link } from "wouter";
import deployVanImage from "@assets/Your paragraph text_1749582551751.png";
import deliveryVanImage from "@assets/IMG_0479_1749582551751.png";

export default function LandingPage() {
  const { isAuthenticated, isLoading } = useAuth();
  const [, setLocation] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  // Remove automatic redirect - let users stay on landing page

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white">
      {/* Header */}
      <header className="glass shadow-retina-lg sticky top-0 z-50 backdrop-blur-xl safe-area-padding">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16 sm:h-20">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 sm:w-12 sm:h-12 bg-primary rounded-lg flex items-center justify-center">
                <Truck className="text-white h-5 w-5 sm:h-6 sm:w-6" />
              </div>
              <div>
                <h1 className="text-lg sm:text-xl font-bold text-gray-900">Choose 2 ACHIEVEMOR</h1>
                <p className="text-xs sm:text-sm text-gray-500">Owner Operator Platform</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              <Link href="/about" className="text-gray-600 hover:text-primary transition-colors touch-manipulation">
                About
              </Link>
              <Link href="/driver-checklist" className="text-gray-600 hover:text-primary transition-colors touch-manipulation">
                Authority Checklist
              </Link>
              <Link href="/register/contractor" className="text-gray-600 hover:text-primary transition-colors touch-manipulation">
                Join as Driver
              </Link>
              <Link href="/register/company" className="text-gray-600 hover:text-primary transition-colors touch-manipulation">
                Partner Company
              </Link>
              <a 
                href="tel:912-742-9459" 
                className="text-accent hover:text-gray-900 transition-colors touch-manipulation"
              >
                912-742-9459
              </a>
              <Link href="/login">
                <Button className="bg-primary hover:bg-primary/90 touch-manipulation">
                  Sign In
                </Button>
              </Link>
            </nav>

            {/* Mobile Menu Button */}
            <div className="lg:hidden">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="touch-manipulation min-h-[48px] min-w-[48px]"
              >
                {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </Button>
            </div>
          </div>

          {/* Mobile Navigation */}
          {isMobileMenuOpen && (
            <div className="lg:hidden border-t border-gray-200 py-4 tablet-nav">
              <div className="flex flex-col space-y-4">
                <Link 
                  href="/about" 
                  className="text-gray-600 hover:text-primary transition-colors px-4 py-3 touch-manipulation"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  About
                </Link>
                <Link 
                  href="/driver-checklist" 
                  className="text-gray-600 hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Authority Checklist
                </Link>
                <Link 
                  href="/register/contractor" 
                  className="text-gray-600 hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Join as Driver
                </Link>
                <Link 
                  href="/register/company" 
                  className="text-gray-600 hover:text-primary transition-colors px-2 py-1"
                  onClick={() => setIsMobileMenuOpen(false)}
                >
                  Partner Company
                </Link>
                <a 
                  href="tel:912-742-9459" 
                  className="text-accent hover:text-gray-900 transition-colors px-2 py-1"
                >
                  912-742-9459
                </a>
                <Link href="/login">
                  <Button className="bg-primary hover:bg-primary/90 mx-2">
                    Sign In
                  </Button>
                </Link>
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-white via-blue-50/30 to-orange-50/20 min-h-[80vh] flex items-center">
        <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg%20width%3D%2260%22%20height%3D%2260%22%20viewBox%3D%220%200%2060%2060%22%20xmlns%3D%22http%3A//www.w3.org/2000/svg%22%3E%3Cg%20fill%3D%22none%22%20fill-rule%3D%22evenodd%22%3E%3Cg%20fill%3D%22%233B82F6%22%20fill-opacity%3D%220.03%22%3E%3Ccircle%20cx%3D%2230%22%20cy%3D%2230%22%20r%3D%221%22/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-40"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 py-12 lg:py-20 w-full">
          <div className="text-center space-y-8">
            <div className="space-y-6">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-900 leading-tight animate-fade-in mx-auto max-w-4xl">
                Choose 2 <span className="gradient-text">ACHIEVEMOR</span>
                <span className="block text-primary mt-2">Owner Operator Platform</span>
              </h1>
              <p className="text-lg md:text-xl text-gray-600 leading-relaxed max-w-3xl mx-auto animate-slide-up">
                The premium onboarding platform for owner operator independent contractors. 
                Streamlined compliance verification, verified job opportunities, and AI-powered business growth services.
              </p>
            </div>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center animate-scale-in">
              <Button 
                size="xl" 
                variant="premium"
                asChild
                className="shadow-xl text-lg px-8 py-4"
              >
                <Link href="/register/contractor">Start Your Journey</Link>
              </Button>
              <Button 
                size="xl" 
                variant="outline" 
                onClick={() => setLocation('/driver-checklist')}
                className="text-lg px-8 py-4"
              >
                Authority Checklist
              </Button>
            </div>
              
            <div className="flex items-center justify-center flex-wrap gap-6 text-sm text-gray-600 animate-fade-in">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <span>Live Platform</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <span>AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse"></div>
                <span>DOT Compliant</span>
              </div>
            </div>
            
            <div className="flex justify-center animate-fade-in mt-12">
              <div className="relative w-full max-w-2xl">
                <div className="absolute -inset-4 bg-gradient-to-r from-primary/20 to-accent/20 rounded-3xl blur-xl opacity-60"></div>
                <img 
                  src={deployVanImage} 
                  alt="ACHIEVEMOR AI-Powered Logistics Solutions" 
                  className="relative w-full h-auto rounded-2xl shadow-2xl premium-card border-0 transform hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-primary/10 to-transparent rounded-2xl"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* T-Chart Section - Split for Contractors and Companies */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12 animate-fade-in">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
              Choose Your Path to <span className="gradient-text">Success</span>
            </h2>
            <p className="text-xl text-gray-600 text-center max-w-3xl mx-auto">
              Join our elite network as a driver or partner with us as a company for premium logistics solutions
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Owner Operators Side */}
            <Card className="premium-card glass-card animate-slide-up group overflow-hidden">
              <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-white">
                <div className="flex items-center justify-center space-x-3">
                  <Truck className="h-8 w-8 animate-pulse" />
                  <CardTitle className="text-2xl font-bold">Owner Operators</CardTitle>
                </div>
                <p className="text-center text-primary-foreground/90 font-medium">
                  Join our elite network of independent contractors
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-6">
                  <img 
                    src={deliveryVanImage} 
                    alt="Owner Operator Delivery Services" 
                    className="w-full h-48 object-cover rounded-lg mb-4"
                  />
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Competitive Pay</h4>
                      <p className="text-gray-600">Earn top rates with transparent pricing and no hidden fees</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Flexible Schedule</h4>
                      <p className="text-gray-600">Choose your own hours and work when it suits you</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">DOT Compliance Support</h4>
                      <p className="text-gray-600">Expert guidance on authority, insurance, and regulations</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <MapPin className="h-6 w-6 text-red-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Local & Regional Routes</h4>
                      <p className="text-gray-600">Georgia-based with Southeast and nationwide opportunities</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    size="lg" 
                    variant="premium"
                    asChild
                    className="w-full"
                  >
                    <Link href="/register/contractor">Join as Driver</Link>
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    CDL required • Background check • Quick approval
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Companies Side */}
            <Card className="glass shadow-retina-lg border-2 border-accent/20 hover:border-accent/40 hover:shadow-retina-xl transition-retina group">
              <CardHeader className="bg-accent text-white rounded-t-lg">
                <div className="flex items-center justify-center space-x-3">
                  <Building2 className="h-8 w-8" />
                  <CardTitle className="text-2xl">Partner Companies</CardTitle>
                </div>
                <p className="text-center text-accent-foreground/90">
                  Access our verified driver network
                </p>
              </CardHeader>
              <CardContent className="p-8">
                <div className="mb-6 bg-gradient-to-r from-blue-50 to-purple-50 p-6 rounded-lg">
                  <div className="text-center">
                    <Users className="h-12 w-12 text-accent mx-auto mb-3" />
                    <h3 className="font-bold text-gray-900 mb-2">On-Demand Fleet Access</h3>
                    <p className="text-gray-600">Instantly scale your delivery capacity</p>
                  </div>
                </div>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Pre-Screened Drivers</h4>
                      <p className="text-gray-600">All contractors are verified, licensed, and insured</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Clock className="h-6 w-6 text-blue-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Real-Time Tracking</h4>
                      <p className="text-gray-600">Monitor deliveries with live GPS and status updates</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <DollarSign className="h-6 w-6 text-green-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Cost-Effective</h4>
                      <p className="text-gray-600">No fleet maintenance, insurance, or driver management costs</p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-3">
                    <Shield className="h-6 w-6 text-purple-600 mt-1 flex-shrink-0" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Full Compliance</h4>
                      <p className="text-gray-600">DOT-compliant operations with proper documentation</p>
                    </div>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <Button 
                    size="lg" 
                    asChild
                    className="w-full bg-accent hover:bg-accent/90"
                  >
                    <Link href="/register/company">Partner With Us</Link>
                  </Button>
                  <p className="text-center text-sm text-gray-500 mt-2">
                    Enterprise accounts • Custom integrations • 24/7 support
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 py-20">
        <div className="text-center mb-16 animate-fade-in">
          <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
            Platform <span className="gradient-text">Features</span>
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Comprehensive logistics management powered by AI and built for the future of transportation
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="glass shadow-retina border-2 hover:border-primary/20 hover:shadow-retina-lg transition-retina">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Truck className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Quality Opportunities</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Access to vetted delivery jobs with competitive rates and reliable customers across Georgia and beyond.</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Shield className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Compliance Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Expert guidance on DOT requirements, MC Authority, insurance, and all regulatory compliance needs.</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Transparent Pricing</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Fair payment terms with detailed cost breakdowns. No hidden fees or surprise deductions.</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Clock className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>24/7 Support</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Round-the-clock support for emergencies, route assistance, and customer service needs.</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Local & Regional</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Based in Pooler, GA, with opportunities throughout the Southeast and nationwide networks.</p>
            </CardContent>
          </Card>

          <Card className="border-2 hover:border-primary/20 transition-colors">
            <CardHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <CheckCircle className="h-6 w-6 text-primary" />
              </div>
              <CardTitle>Proven Track Record</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">Established 2025 with DOT #4398142 and MC #1726115. Licensed, bonded, and fully compliant.</p>
            </CardContent>
          </Card>
        </div>
      </section>

      {/* Requirements Section */}
      <section className="bg-gray-50 py-16">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Getting Started Requirements</h2>
            <p className="text-xl text-gray-600">Simple steps to join our contractor network</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Required Documentation
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• Valid Commercial Driver's License (CDL)</li>
                  <li>• DOT Physical Certificate</li>
                  <li>• Vehicle Registration & Title</li>
                  <li>• Commercial Insurance</li>
                  <li>• Business License (if applicable)</li>
                </ul>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-green-600 mr-2" />
                  Authority & Compliance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-gray-600">
                  <li>• DOT Number registration</li>
                  <li>• MC Authority (for interstate)</li>
                  <li>• BOC-3 Process Agent filing</li>
                  <li>• IFTA/IRP registrations</li>
                  <li>• Drug & alcohol testing program</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Start Your Journey?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join ACHIEVEMOR's growing network of successful independent contractors
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              onClick={() => window.location.href = '/api/login'}
              className="text-lg px-8 py-3"
            >
              Sign Up Now
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary"
              onClick={() => window.location.href = 'mailto:delivered@byachievemor.com'}
            >
              Contact Us
            </Button>
          </div>
        </div>
      </section>

      {/* Final CTA Section */}
      <section className="bg-primary text-white py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful partnerships on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button 
              size="lg" 
              variant="secondary"
              asChild
              className="text-lg px-8 py-3"
            >
              <Link href="/register/contractor">Join as Driver</Link>
            </Button>
            <Button 
              size="lg" 
              variant="outline"
              asChild
              className="text-lg px-8 py-3 border-white text-white hover:bg-white hover:text-primary"
            >
              <Link href="/register/company">Partner Company</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12 relative">
        <div className="max-w-7xl mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center space-x-3 mb-4">
                <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                  <Truck className="text-white h-4 w-4" />
                </div>
                <span className="text-xl font-bold">ACHIEVEMOR LLC</span>
              </div>
              <p className="text-gray-400 mb-4">
                AI-powered logistics solutions connecting businesses with verified independent contractors.
              </p>
              <div className="space-y-2 text-sm">
                <p>MC #1726115 | DOT #4398142</p>
                <p>Licensed, Bonded & Insured</p>
                <a 
                  href="https://achvmr-forms.paperform.co/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="block text-primary hover:text-primary/80 transition-colors"
                >
                  → Business Needs Assessment
                </a>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Contact Information</h4>
              <div className="space-y-2 text-gray-400">
                <p>Pooler, GA 31322</p>
                <p>Phone: (912) 742-9459</p>
                <p>Email: delivered@byachievemor.com</p>
                <p>Web: byachievemor.com</p>
              </div>
            </div>
            
            <div>
              <h4 className="font-semibold mb-4">Quick Links</h4>
              <div className="space-y-2">
                <Link href="/about" className="block text-gray-400 hover:text-white transition-colors">
                  About Ecosystem
                </Link>
                <Link href="/register/contractor" className="block text-gray-400 hover:text-white transition-colors">
                  Driver Registration
                </Link>
                <Link href="/register/company" className="block text-gray-400 hover:text-white transition-colors">
                  Company Partnership
                </Link>
                <Link href="/api/login" className="block text-gray-400 hover:text-white transition-colors">
                  Sign In
                </Link>
                <a href="tel:912-742-9459" className="block text-gray-400 hover:text-white transition-colors">
                  Contact Support
                </a>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2025 ACHIEVEMOR LLC. All rights reserved.</p>
          </div>
        </div>

        {/* Sitemap in bottom right */}
        <div className="absolute bottom-4 right-4">
          <div className="bg-gray-800 rounded-lg p-3 text-xs">
            <h5 className="font-semibold text-white mb-2">Site Map</h5>
            <div className="space-y-1 text-gray-400">
              <Link href="/" className="block hover:text-white transition-colors">Home</Link>
              <Link href="/about" className="block hover:text-white transition-colors">About</Link>
              <Link href="/register/contractor" className="block hover:text-white transition-colors">Driver Sign-up</Link>
              <Link href="/register/company" className="block hover:text-white transition-colors">Company Sign-up</Link>
              <Link href="/api/login" className="block hover:text-white transition-colors">Login</Link>
            </div>
          </div>
        </div>
      </footer>

      {/* Edge Function Chatbot */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        mode="edge"
        position="bottom-right"
      />
    </div>
  );
}