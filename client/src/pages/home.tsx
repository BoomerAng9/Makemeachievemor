import { useState } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useMutation } from "@tanstack/react-query";
import { 
  Truck, 
  Shield, 
  Users, 
  FileText, 
  CheckCircle, 
  ArrowRight, 
  Star,
  Award,
  TrendingUp,
  Phone,
  Mail,
  MapPin,
  MessageSquare,
  Zap,
  Clock,
  Target
} from "lucide-react";

export default function HomePage() {
  const { toast } = useToast();
  const [contactForm, setContactForm] = useState({
    name: "",
    email: "",
    phone: "",
    note: ""
  });

  const contactMutation = useMutation({
    mutationFn: async (data: typeof contactForm) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: () => {
      toast({
        title: "Message Sent Successfully",
        description: "Thank you for your interest! Our team will contact you within 24 hours.",
      });
      setContactForm({ name: "", email: "", phone: "", note: "" });
    },
    onError: (error: any) => {
      toast({
        title: "Message Failed",
        description: error.message || "Please try again or call us directly.",
        variant: "destructive",
      });
    },
  });

  const handleContactSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!contactForm.name || !contactForm.email || !contactForm.note) {
      toast({
        title: "Required Fields Missing",
        description: "Please fill in your name, email, and message.",
        variant: "destructive",
      });
      return;
    }
    contactMutation.mutate(contactForm);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800">
      {/* Hero Section */}
      <section className="relative py-20 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <div className="mb-8">
            <Badge variant="secondary" className="mb-4 px-4 py-2 text-sm font-medium">
              🚛 Leading Owner Operator Platform
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold text-gray-900 dark:text-white mb-6">
              <span className="bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                ACHIEVEMOR
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-600 dark:text-gray-300 mb-8 max-w-4xl mx-auto leading-relaxed">
              Empowering Owner Operator Independent Contractors with intelligent technology, 
              comprehensive compliance tracking, and streamlined business management solutions.
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/register">
              <Button size="lg" className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700">
                Get Started Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            <div className="text-center">
              <div className="bg-blue-100 dark:bg-blue-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">DOT Compliance</h3>
              <p className="text-gray-600 dark:text-gray-400">Complete authority setup and ongoing compliance monitoring</p>
            </div>
            <div className="text-center">
              <div className="bg-green-100 dark:bg-green-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-green-600 dark:text-green-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">AI-Powered Insights</h3>
              <p className="text-gray-600 dark:text-gray-400">Personalized dashboard with intelligent recommendations</p>
            </div>
            <div className="text-center">
              <div className="bg-purple-100 dark:bg-purple-900 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-xl font-semibold mb-2">Expert Support</h3>
              <p className="text-gray-600 dark:text-gray-400">Professional guidance throughout your trucking journey</p>
            </div>
          </div>
        </div>
      </section>

      {/* Platform Features */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Comprehensive Platform Features
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              Everything you need to succeed as an Owner Operator Independent Contractor
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-lg flex items-center justify-center mb-4">
                  <CheckCircle className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                </div>
                <CardTitle>Authority Setup Checklist</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Comprehensive 30-item compliance tracking system covering federal authority, 
                  business formation, insurance, and operational requirements with user account integration.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-green-600 dark:text-green-400" />
                </div>
                <CardTitle>AI-Powered Dashboard</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Personalized insights and next-step recommendations powered by advanced AI technology 
                  to optimize your business operations and compliance status.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center mb-4">
                  <Shield className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Background Check Integration</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Automated screening with multiple provider support for comprehensive background 
                  verification and compliance documentation.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900 rounded-lg flex items-center justify-center mb-4">
                  <FileText className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                </div>
                <CardTitle>Glovebox Document Storage</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Secure document management with social media sharing capabilities for professional 
                  credential showcasing and instant verification.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-red-100 dark:bg-red-900 rounded-lg flex items-center justify-center mb-4">
                  <Clock className="h-6 w-6 text-red-600 dark:text-red-400" />
                </div>
                <CardTitle>Progress Persistence</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  User account integration ensuring progress is automatically saved with resume 
                  capability across all devices and platforms.
                </CardDescription>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow duration-300">
              <CardHeader>
                <div className="w-12 h-12 bg-teal-100 dark:bg-teal-900 rounded-lg flex items-center justify-center mb-4">
                  <Target className="h-6 w-6 text-teal-600 dark:text-teal-400" />
                </div>
                <CardTitle>Enhanced Security</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  Advanced security features including screenshot prevention, screen recording protection, 
                  and comprehensive data breach prevention measures.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Company Information */}
      <section className="py-20 px-6 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-6">
                About ACHIEVEMOR LLC
              </h2>
              <p className="text-lg text-gray-600 dark:text-gray-300 mb-6 leading-relaxed">
                Located in Pooler, Georgia, ACHIEVEMOR LLC is a comprehensive platform dedicated to 
                empowering Owner Operator Independent Contractors with cutting-edge technology and 
                expert guidance for successful trucking business operations.
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <Award className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">DOT Number: 4398142</span>
                </div>
                <div className="flex items-center">
                  <Shield className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">MC Number: 1726115</span>
                </div>
                <div className="flex items-center">
                  <CheckCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span className="text-gray-700 dark:text-gray-300">BOC-3: EVILSIZOR PROCESS SERVERS LLC</span>
                </div>
              </div>
            </div>
            
            <Card className="p-8">
              <CardHeader className="text-center pb-6">
                <CardTitle className="text-2xl">Get In Touch</CardTitle>
                <CardDescription>
                  Ready to start your trucking business journey? Contact our expert team.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center">
                  <MapPin className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span>275 LONGLEAF CIR, POOLER, GA 31322</span>
                </div>
                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span>(912) 742-9459</span>
                </div>
                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-blue-600 dark:text-blue-400 mr-3" />
                  <span>delivered@byachievemor.com</span>
                </div>
                <Separator />
                <Link href="/register">
                  <Button className="w-full" size="lg">
                    Start Your Partnership Today
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Contact Form Section */}
      <section className="py-20 px-6 bg-white dark:bg-gray-900">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Partner With Us
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300">
              Ready to take your trucking business to the next level? Let's discuss partnership opportunities.
            </p>
          </div>

          <Card className="p-8">
            <form onSubmit={handleContactSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="name" className="block text-sm font-medium mb-2">
                    Full Name *
                  </label>
                  <Input
                    id="name"
                    value={contactForm.name}
                    onChange={(e) => setContactForm(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Your full name"
                    required
                  />
                </div>
                <div>
                  <label htmlFor="email" className="block text-sm font-medium mb-2">
                    Email Address *
                  </label>
                  <Input
                    id="email"
                    type="email"
                    value={contactForm.email}
                    onChange={(e) => setContactForm(prev => ({ ...prev, email: e.target.value }))}
                    placeholder="your.email@example.com"
                    required
                  />
                </div>
              </div>
              
              <div>
                <label htmlFor="phone" className="block text-sm font-medium mb-2">
                  Phone Number
                </label>
                <Input
                  id="phone"
                  type="tel"
                  value={contactForm.phone}
                  onChange={(e) => setContactForm(prev => ({ ...prev, phone: e.target.value }))}
                  placeholder="(555) 123-4567"
                />
              </div>
              
              <div>
                <label htmlFor="note" className="block text-sm font-medium mb-2">
                  Message *
                </label>
                <Textarea
                  id="note"
                  value={contactForm.note}
                  onChange={(e) => setContactForm(prev => ({ ...prev, note: e.target.value }))}
                  placeholder="Tell us about your trucking business goals and how we can help..."
                  rows={5}
                  required
                />
              </div>
              
              <Button 
                type="submit" 
                size="lg" 
                className="w-full" 
                disabled={contactMutation.isPending}
              >
                {contactMutation.isPending ? (
                  <>
                    <div className="animate-spin w-4 h-4 border-2 border-white border-t-transparent rounded-full mr-2" />
                    Sending Message...
                  </>
                ) : (
                  <>
                    <MessageSquare className="mr-2 h-4 w-4" />
                    Send Partnership Inquiry
                  </>
                )}
              </Button>
            </form>
          </Card>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-20 px-6 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h2 className="text-4xl font-bold mb-6">
            Ready to Transform Your Trucking Business?
          </h2>
          <p className="text-xl mb-8 opacity-90">
            Join thousands of successful Owner Operators who trust ACHIEVEMOR for their business success.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register">
              <Button size="lg" variant="secondary" className="px-8 py-4 text-lg font-semibold">
                Create Your Account
                <ArrowRight className="ml-2 h-5 w-5" />
              </Button>
            </Link>

          </div>
        </div>
      </section>
    </div>
  );
}