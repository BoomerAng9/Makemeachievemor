import { useState } from "react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/useAuth";
import { UniversalNav } from "@/components/UniversalNav";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  Truck, 
  Phone, 
  Mail, 
  MapPin, 
  Shield, 
  DollarSign, 
  Users, 
  CheckCircle, 
  Clock, 
  Star,
  ArrowRight,
  Award,
  FileText,
  TrendingUp,
  Headphones
} from "lucide-react";

export default function HomePage() {
  const { isAuthenticated } = useAuth();
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    note: ""
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      // Submit contact form
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        alert("Thank you for your message! We'll be in touch soon.");
        setFormData({ name: "", email: "", phone: "", note: "" });
      }
    } catch (error) {
      alert("There was an error sending your message. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const features = [
    {
      icon: <Truck className="h-12 w-12 text-blue-600" />,
      title: "Reliable Transportation",
      description: "Trust is paramount in our industry, and our commitment is steadfast. We're committed to providing dependable transportation, ensuring your cargo is safe and on time. Every journey, every load, we prioritize reliability.",
      image: "/images/s-boxtruck.jpg"
    },
    {
      icon: <Headphones className="h-12 w-12 text-green-600" />,
      title: "Dedicated Customer Support",
      description: "Our customers are the backbone of our business. That's why we're dedicated to providing professional and responsive support. Whether you have a query, need an update, or face any unforeseen challenges, we're just a call away.",
      image: "/images/s-phone.jpg"
    },
    {
      icon: <DollarSign className="h-12 w-12 text-purple-600" />,
      title: "Cost-Effective Solutions",
      description: "Quality service doesn't have to break the bank. We pride ourselves on offering transportation that is both dependable and affordable. Our strategic approach allows us to provide top-tier services at competitive prices.",
      image: "/images/s-charts.jpg"
    }
  ];

  const stats = [
    { label: "DOT Number", value: "4398142" },
    { label: "MC Number", value: "1726115" },
    { label: "BOC-3", value: "EVILSIZOR PROCESS SERVERS LLC" }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 dark:from-slate-900 dark:to-blue-900">
      <UniversalNav />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-r from-blue-900 via-blue-800 to-blue-900 text-white">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="container mx-auto px-4 py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <Badge className="mb-6 bg-blue-600 hover:bg-blue-700 text-white border-blue-500">
              <Award className="h-4 w-4 mr-2" />
              Your Trusted Transportation Partner
            </Badge>
            
            <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
              ACHIEVEMOR
              <span className="block text-blue-300 text-3xl md:text-4xl font-medium mt-2">
                Professional Transportation Solutions
              </span>
            </h1>
            
            <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
              Your trusted partner in transportation. We're committed to excellent customer service and getting your cargo to its destination safely and on time.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              {!isAuthenticated ? (
                <>
                  <Link href="/register">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                      Partner With Us
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/opportunities">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                      View Opportunities
                    </Button>
                  </Link>
                </>
              ) : (
                <>
                  <Link href="/dashboard">
                    <Button size="lg" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 text-lg">
                      Go to Dashboard
                      <ArrowRight className="h-5 w-5 ml-2" />
                    </Button>
                  </Link>
                  <Link href="/opportunities">
                    <Button variant="outline" size="lg" className="border-white text-white hover:bg-white hover:text-blue-900 px-8 py-4 text-lg">
                      Find Jobs
                    </Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Why Choose ACHIEVEMOR?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              We combine reliability, professionalism, and cost-effectiveness to deliver exceptional transportation services.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="group hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto mb-4 p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-full w-fit group-hover:scale-110 transition-transform duration-300">
                    {feature.icon}
                  </div>
                  <CardTitle className="text-2xl font-bold">{feature.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground leading-relaxed text-center">
                    {feature.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Platform Benefits Section */}
      <section className="py-20 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4">Join the ACHIEVEMOR Platform</h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Access cutting-edge tools, professional opportunities, and comprehensive support for independent contractors and fleet operators.
            </p>
          </div>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div className="space-y-8">
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="h-8 w-8 text-green-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Smart Document Management</h3>
                  <p className="text-muted-foreground">Secure Glovebox system for all your compliance documents with expiration tracking and sharing capabilities.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <TrendingUp className="h-8 w-8 text-blue-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
                  <p className="text-muted-foreground">Personalized recommendations and performance analytics to help you grow your business.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Users className="h-8 w-8 text-purple-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Professional Network</h3>
                  <p className="text-muted-foreground">Connect with verified shippers and join a trusted community of transportation professionals.</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-4">
                <div className="flex-shrink-0">
                  <Shield className="h-8 w-8 text-red-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2">Background Check Integration</h3>
                  <p className="text-muted-foreground">Streamlined verification process with automated background checks and compliance monitoring.</p>
                </div>
              </div>
            </div>
            
            <div className="lg:text-center">
              <Card className="p-8 shadow-2xl">
                <div className="mb-6">
                  <h3 className="text-2xl font-bold mb-4">Ready to Get Started?</h3>
                  <p className="text-muted-foreground mb-6">
                    Join thousands of professional drivers and contractors who trust ACHIEVEMOR for their transportation needs.
                  </p>
                </div>
                
                {!isAuthenticated ? (
                  <div className="space-y-4">
                    <Link href="/register">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Create Your Account
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <p className="text-sm text-muted-foreground">
                      Already have an account? 
                      <Link href="/login" className="text-blue-600 hover:underline ml-1">
                        Sign in here
                      </Link>
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <Link href="/dashboard">
                      <Button size="lg" className="w-full bg-blue-600 hover:bg-blue-700 text-white">
                        Access Your Dashboard
                        <ArrowRight className="h-5 w-5 ml-2" />
                      </Button>
                    </Link>
                    <Link href="/glovebox">
                      <Button variant="outline" size="lg" className="w-full">
                        Manage Documents
                      </Button>
                    </Link>
                  </div>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-blue-900 text-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">By The Numbers</h2>
            <p className="text-blue-200">Our official transportation credentials and certifications</p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <Card key={index} className="bg-blue-800 border-blue-700 text-center">
                <CardContent className="p-6">
                  <div className="text-sm text-blue-200 mb-2">{stat.label}</div>
                  <div className="text-2xl font-bold text-white">{stat.value}</div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <section className="py-20" id="contact">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
            {/* Contact Form */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Drop Us A Line</h2>
              <p className="text-muted-foreground mb-8">
                Ready to partner with us? Have questions about our services? We'd love to hear from you.
              </p>
              
              <Card className="p-6">
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div>
                    <Label htmlFor="name">Your Name *</Label>
                    <Input
                      id="name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                      placeholder="Enter your full name"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="email">Email *</Label>
                    <Input
                      id="email"
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      required
                      placeholder="Enter your email address"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="phone">Phone</Label>
                    <Input
                      id="phone"
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({...formData, phone: e.target.value})}
                      placeholder="(555) 123-4567"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="note">Note *</Label>
                    <Textarea
                      id="note"
                      value={formData.note}
                      onChange={(e) => setFormData({...formData, note: e.target.value})}
                      required
                      placeholder="Tell us about your transportation needs or questions"
                      rows={4}
                    />
                  </div>
                  
                  <Button 
                    type="submit" 
                    size="lg" 
                    className="w-full bg-blue-600 hover:bg-blue-700"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Sending..." : "Submit"}
                  </Button>
                </form>
              </Card>
            </div>
            
            {/* Contact Info */}
            <div>
              <h2 className="text-3xl font-bold mb-6">Get In Touch</h2>
              
              <Card className="p-6 mb-6">
                <h3 className="text-xl font-semibold mb-4">ACHIEVEMOR LLC</h3>
                <p className="text-muted-foreground mb-6">
                  Your trusted partner in transportation. We're committed to excellent customer service and getting your cargo to its destination safely and on time.
                </p>
                
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <MapPin className="h-5 w-5 text-blue-600" />
                    <div>
                      <div className="font-medium">275 LONGLEAF CIR</div>
                      <div className="text-sm text-muted-foreground">POOLER, GA 31322</div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Phone className="h-5 w-5 text-green-600" />
                    <div>
                      <a href="tel:+19127429459" className="font-medium hover:text-blue-600">
                        (912) 742-9459
                      </a>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    <Mail className="h-5 w-5 text-purple-600" />
                    <div>
                      <a href="mailto:Delivered@byachievemor.com" className="font-medium hover:text-blue-600">
                        Delivered@byachievemor.com
                      </a>
                    </div>
                  </div>
                </div>
              </Card>
              
              <Card className="p-6 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950">
                <h3 className="text-xl font-semibold mb-4">Ready to Start?</h3>
                <p className="text-muted-foreground mb-4">
                  Join our platform and access professional transportation opportunities, document management, and business growth tools.
                </p>
                {!isAuthenticated ? (
                  <Link href="/register">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Partner With ACHIEVEMOR
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                ) : (
                  <Link href="/dashboard">
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      Access Dashboard
                      <ArrowRight className="h-4 w-4 ml-2" />
                    </Button>
                  </Link>
                )}
              </Card>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}