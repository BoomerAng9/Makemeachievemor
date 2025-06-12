import { useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { UniversalNav } from "@/components/UniversalNav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Truck, Phone, DollarSign, Users, Star, Shield, MapPin, Mail, CheckCircle, ArrowRight, Target, Award, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: ""
  });

  // Contact form submission
  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      return apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent",
        description: "Thank you for contacting us. We'll get back to you within 24 hours.",
      });
      setContactForm({ name: "", email: "", phone: "", note: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Error",
        description: error.message || "Failed to send message",
        variant: "destructive",
      });
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.note) {
      toast({
        title: "Required Fields",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(contactForm);
  };

  const services = [
    {
      icon: <Truck className="h-8 w-8 text-blue-600" />,
      title: "RELIABLE TRANSPORTATION",
      description: "Trust is paramount in our industry, and our commitment is steadfast. We're committed to providing dependable transportation, ensuring your cargo is safe and on time. Every journey, every load, we prioritize reliability.",
      image: "/images/s-boxtruck.jpg"
    },
    {
      icon: <Phone className="h-8 w-8 text-green-600" />,
      title: "DEDICATED CUSTOMER SUPPORT",
      description: "Our customers are the backbone of our business. That's why we're dedicated to providing professional and responsive support. Whether you have a query, need an update, or face any unforeseen challenges, we're just a call away.",
      image: "/images/s-phone.jpg"
    },
    {
      icon: <DollarSign className="h-8 w-8 text-orange-600" />,
      title: "COST-EFFECTIVE SOLUTIONS",
      description: "Quality service doesn't have to break the bank. We pride ourselves on offering transportation that is both dependable and affordable. Our strategic approach allows us to provide top-tier services at competitive prices.",
      image: "/images/s-charts.jpg"
    }
  ];

  const stats = [
    { label: "Professional Drivers", value: "5,000+", icon: <Users className="h-6 w-6" /> },
    { label: "Safety Rating", value: "99.8%", icon: <Shield className="h-6 w-6" /> },
    { label: "On-Time Delivery", value: "98.5%", icon: <Clock className="h-6 w-6" /> },
    { label: "Customer Satisfaction", value: "4.9/5", icon: <Star className="h-6 w-6" /> }
  ];

  const partnershipBenefits = [
    {
      icon: <Target className="h-6 w-6 text-blue-600" />,
      title: "Streamlined Onboarding",
      description: "Fast-track your qualification process with our digital document verification and compliance tracking system."
    },
    {
      icon: <Award className="h-6 w-6 text-green-600" />,
      title: "Professional Development",
      description: "Access training programs, certifications, and career advancement opportunities designed for trucking professionals."
    },
    {
      icon: <Shield className="h-6 w-6 text-orange-600" />,
      title: "Business Support",
      description: "Get assistance with Authority setup, compliance management, and business operations to succeed as an Owner Operator."
    },
    {
      icon: <Users className="h-6 w-6 text-purple-600" />,
      title: "Network Access",
      description: "Join a community of verified professionals and access exclusive job opportunities from trusted partners."
    }
  ];

  return (
    <div className="min-h-screen bg-white">
      <UniversalNav />

      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 to-blue-700 text-white pt-24 pb-16">
        <div className="absolute inset-0 bg-black opacity-10"></div>
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Your Trusted Partner in{" "}
              <span className="text-yellow-400">Transportation Excellence</span>
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-blue-100">
              ACHIEVEMOR LLC - Connecting professional drivers with opportunities through innovative technology and reliable partnerships
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              {!isAuthenticated ? (
                <>
                  <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg">
                    Partner With Us Today
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  <Button size="lg" variant="outline" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                    Learn More
                  </Button>
                </>
              ) : (
                <Button size="lg" className="bg-yellow-500 hover:bg-yellow-600 text-black font-semibold px-8 py-4 text-lg" onClick={() => window.location.href = '/dashboard'}>
                  Access Your Dashboard
                  <ArrowRight className="ml-2 h-5 w-5" />
                </Button>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">By The Numbers</h2>
            <p className="text-gray-600 text-lg">Trusted by thousands of professional drivers nationwide</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <Card key={index} className="text-center border-0 shadow-lg">
                <CardContent className="pt-6">
                  <div className="flex justify-center mb-4 text-blue-600">
                    {stat.icon}
                  </div>
                  <div className="text-3xl font-bold text-gray-900 mb-2">{stat.value}</div>
                  <div className="text-gray-600">{stat.label}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Services Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Our Core Services</h2>
            <p className="text-gray-600 text-lg">Excellence in every aspect of transportation services</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {services.map((service, index) => (
              <Card key={index} className="text-center hover:shadow-xl transition-shadow">
                <CardContent className="p-8">
                  <div className="flex justify-center mb-6">
                    {service.icon}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{service.title}</h3>
                  <p className="text-gray-600 leading-relaxed">{service.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Partnership Benefits Section */}
      <section className="py-16 bg-blue-50">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Partner With ACHIEVEMOR?</h2>
            <p className="text-gray-600 text-lg">Take the next step in your professional driving career</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {partnershipBenefits.map((benefit, index) => (
              <Card key={index} className="border-0 shadow-lg">
                <CardContent className="p-6">
                  <div className="flex items-start space-x-4">
                    <div className="flex-shrink-0 p-3 bg-white rounded-lg shadow-sm">
                      {benefit.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold text-gray-900 mb-2">{benefit.title}</h3>
                      <p className="text-gray-600">{benefit.description}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
          <div className="text-center mt-12">
            <Button size="lg" className="bg-blue-600 hover:bg-blue-700 px-8 py-4 text-lg">
              Start Your Partnership Journey
              <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </div>
        </div>
      </section>

      {/* DOT Information Section */}
      <section className="py-16 bg-gray-900 text-white">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">ACHIEVEMOR LLC</h2>
              <p className="text-xl text-gray-300">Your trusted partner in transportation. We're committed to excellent customer service and getting your cargo to its destination safely and on time.</p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">DOT Number</h3>
                <p className="text-2xl font-bold">4398142</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">MC Number</h3>
                <p className="text-2xl font-bold">1726115</p>
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-2 text-yellow-400">BOC-3 Provider</h3>
                <p className="text-lg">EVILSIZOR PROCESS SERVERS LLC</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-16 bg-white" id="contact">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
              {/* Contact Form */}
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-6">Drop Us A Line</h2>
                <p className="text-gray-600 mb-8">Ready to partner with us? Have questions about our services? Get in touch and let's discuss how we can help advance your transportation career.</p>
                
                <form onSubmit={handleContactSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={contactForm.name}
                      onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={contactForm.email}
                      onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={contactForm.phone}
                      onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Message *</Label>
                    <Textarea
                      id="note"
                      value={contactForm.note}
                      onChange={(e) => setContactForm(prev => ({ ...prev, note: e.target.value }))}
                      required
                      rows={4}
                      placeholder="Tell us about your transportation needs or questions..."
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full"
                    disabled={contactMutation.isPending}
                  >
                    {contactMutation.isPending ? "Sending..." : "Send Message"}
                  </Button>
                </form>
              </div>

              {/* Contact Information */}
              <div>
                <h3 className="text-2xl font-bold text-gray-900 mb-6">Get In Touch</h3>
                
                <div className="space-y-6">
                  <div className="flex items-start space-x-4">
                    <MapPin className="h-6 w-6 text-blue-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Our Location</h4>
                      <p className="text-gray-600">275 LONGLEAF CIR<br />POOLER, GA 31322</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Phone className="h-6 w-6 text-green-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Phone</h4>
                      <p className="text-gray-600">(912) 742-9459</p>
                    </div>
                  </div>
                  
                  <div className="flex items-start space-x-4">
                    <Mail className="h-6 w-6 text-orange-600 mt-1" />
                    <div>
                      <h4 className="font-semibold text-gray-900">Email</h4>
                      <p className="text-gray-600">Delivered@byachievemor.com</p>
                    </div>
                  </div>
                </div>

                <div className="mt-12 p-6 bg-blue-50 rounded-lg">
                  <h4 className="font-semibold text-gray-900 mb-4">Ready to Get Started?</h4>
                  <p className="text-gray-600 mb-4">Join thousands of professional drivers who have advanced their careers with ACHIEVEMOR.</p>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Quick and easy registration</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Access to verified opportunities</span>
                    </div>
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      <span className="text-sm text-gray-700">Professional support team</span>
                    </div>
                  </div>
                  {!isAuthenticated && (
                    <Button className="w-full mt-4" onClick={() => window.location.href = '/register'}>
                      Start Your Application
                    </Button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div>
              <h3 className="text-xl font-bold mb-4">ACHIEVEMOR LLC</h3>
              <p className="text-gray-400">Professional transportation services and driver partnership opportunities.</p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Services</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="#" className="hover:text-white">Driver Registration</a></li>
                <li><a href="#" className="hover:text-white">Job Opportunities</a></li>
                <li><a href="#" className="hover:text-white">Document Verification</a></li>
                <li><a href="#" className="hover:text-white">Business Support</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-gray-400">
                <li><a href="/about" className="hover:text-white">About Us</a></li>
                <li><a href="#contact" className="hover:text-white">Contact</a></li>
                <li><a href="/sitemap" className="hover:text-white">Sitemap</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Connect</h4>
              <ul className="space-y-2 text-gray-400">
                <li>DOT: 4398142</li>
                <li>MC: 1726115</li>
                <li>(912) 742-9459</li>
                <li>Delivered@byachievemor.com</li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
            <p>&copy; 2024 ACHIEVEMOR LLC. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}