import { Link } from "wouter";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Chatbot } from "@/components/ui/chatbot";
import { ArrowLeft, ExternalLink, Zap, Brain, Users, Rocket, Globe, Code2, Building2, GraduationCap } from "lucide-react";
import deployLogo from "@assets/528362B4-B765-4BF2-A013-74B78A6A50B1_1749583627659.png";

export default function AboutPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);
  const ecosystemPlatforms = [
    {
      name: "Choose 2 ACHIEVEMOR",
      url: "byachievemor.com",
      description: "Owner Operator Independent Contractor Management Platform",
      icon: <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-orange-400 via-amber-500 to-yellow-500 flex items-center justify-center">
        <Building2 className="h-6 w-6 text-white" />
      </div>,
      features: ["Contractor Onboarding", "Compliance Management", "Job Matching", "Business Growth Services"],
      status: "Active",
      color: "from-orange-400 to-yellow-500"
    },
    {
      name: "STARGATE",
      url: "we.byachievemor.us",
      description: "Integrated Learning Platform & Educational Hub",
      icon: <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center">
        <GraduationCap className="h-6 w-6 text-white" />
      </div>,
      features: ["Interactive Learning", "Progress Tracking", "Certification Programs", "Collaborative Tools"],
      status: "Development",
      color: "from-blue-500 to-indigo-600"
    },
    {
      name: "AI-ENGINES",
      url: "ai-engines.byachievemor.us",
      description: "Advanced AI Services & Machine Learning Operations",
      icon: <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-pink-600 flex items-center justify-center">
        <Brain className="h-6 w-6 text-white" />
      </div>,
      features: ["Natural Language Processing", "Computer Vision", "Predictive Analytics", "Custom AI Models"],
      status: "Beta",
      color: "from-purple-500 to-pink-600"
    },
    {
      name: "NURD",
      url: "nurd.byachievemor.us",
      description: "Youth Tech Education & Innovation Platform",
      icon: <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center">
        <Code2 className="h-6 w-6 text-white" />
      </div>,
      features: ["Coding Bootcamps", "Tech Mentorship", "Project Showcases", "Career Guidance"],
      status: "Active",
      color: "from-violet-500 to-purple-600",
      stats: { members: "88+", graduates: "63+" }
    }
  ];

  const subsidiaryServices = [
    {
      name: "Boost|Bridge",
      description: "Career Advancement Services",
      icon: <Rocket className="h-8 w-8 text-green-600" />,
      focus: "Professional Development"
    },
    {
      name: "Per|Form Platform",
      description: "Innovative Talent Network",
      icon: <Users className="h-8 w-8 text-blue-600" />,
      focus: "Talent Acquisition"
    },
    {
      name: "Access AI",
      description: "AI-Powered Analytics & Insights",
      icon: <Brain className="h-8 w-8 text-purple-600" />,
      focus: "Data Intelligence"
    },
    {
      name: "Broad|Cast",
      description: "Marketing & Engagement Platform",
      icon: <Globe className="h-8 w-8 text-orange-600" />,
      focus: "Digital Marketing"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-blue-50">
      {/* Header */}
      <header className="glass border-b sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <Button variant="ghost" size="sm" asChild className="transition-retina">
              <Link href="/">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Home
              </Link>
            </Button>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 deploy-gradient rounded-lg flex items-center justify-center">
                <Building2 className="text-white h-4 w-4" />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-orange-500 bg-clip-text text-transparent">
                ACHIEVEMOR
              </span>
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative py-20">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <div className="flex justify-center mb-8">
              <img 
                src={deployLogo} 
                alt="DEPLOY by ACHIEVEMOR" 
                className="h-32 w-auto drop-shadow-2xl"
              />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6">
              <span className="bg-gradient-to-r from-blue-600 via-purple-600 to-orange-500 bg-clip-text text-transparent">
                The ACHIEVEMOR
              </span>
              <br />
              <span className="text-gray-900">Ecosystem</span>
            </h1>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
              Comprehensive technology ecosystem connecting transportation, logistics, education, and AI-powered solutions 
              to empower independent contractors and transform business operations since 2019.
            </p>
          </div>
        </div>
      </section>

      {/* Main Platforms */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Core Platforms</h2>
            <p className="text-xl text-gray-600">Integrated solutions powering the future of logistics and technology</p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {ecosystemPlatforms.map((platform, index) => (
              <Card key={platform.name} className="glass shadow-retina-lg border-2 hover:shadow-retina-xl transition-retina group">
                <CardHeader className="pb-4">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-4">
                      {platform.icon}
                      <div>
                        <CardTitle className="text-2xl font-bold text-gray-900">
                          {platform.name}
                        </CardTitle>
                        <p className="text-gray-600 mt-1">{platform.description}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge 
                        variant={platform.status === 'Active' ? 'default' : platform.status === 'Beta' ? 'secondary' : 'outline'}
                        className={platform.status === 'Active' ? 'bg-green-100 text-green-800' : ''}
                      >
                        {platform.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-2">
                      {platform.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${platform.color}`} />
                          <span className="text-sm text-gray-700">{feature}</span>
                        </div>
                      ))}
                    </div>

                    {platform.stats && (
                      <div className="flex space-x-6 pt-4 border-t border-gray-200">
                        <div className="text-center">
                          <div className="text-2xl font-bold text-purple-600">{platform.stats.members}</div>
                          <div className="text-xs text-gray-500">Active Members</div>
                        </div>
                        <div className="text-center">
                          <div className="text-2xl font-bold text-green-600">{platform.stats.graduates}</div>
                          <div className="text-xs text-gray-500">Graduates</div>
                        </div>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-4">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Globe className="h-4 w-4" />
                        <span>{platform.url}</span>
                      </div>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="group-hover:bg-primary group-hover:text-white transition-retina"
                        onClick={() => window.open(`https://${platform.url}`, '_blank')}
                      >
                        <ExternalLink className="h-4 w-4 mr-2" />
                        Visit Platform
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* DEPLOY Automation Services */}
      <section className="py-16 bg-gradient-to-r from-orange-50 via-amber-50 to-yellow-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center space-x-3 mb-4">
              <img src={deployLogo} alt="DEPLOY" className="h-16 w-auto" />
              <h2 className="text-4xl font-bold">
                <span className="deploy-gradient bg-clip-text text-transparent">DEPLOY</span>
                <span className="text-gray-900"> Automation Services</span>
              </h2>
            </div>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Powering our logistics platform with cutting-edge AI automation and deployment technologies
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <Card className="glass shadow-retina border-orange-200 hover:shadow-retina-lg transition-retina">
              <CardHeader>
                <div className="w-12 h-12 deploy-gradient rounded-xl flex items-center justify-center mb-4">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Intelligent Routing</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  AI-powered route optimization and real-time traffic analysis for efficient delivery management.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Dynamic route recalculation</li>
                  <li>• Predictive delivery windows</li>
                  <li>• Cost optimization algorithms</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass shadow-retina border-orange-200 hover:shadow-retina-lg transition-retina">
              <CardHeader>
                <div className="w-12 h-12 deploy-gradient rounded-xl flex items-center justify-center mb-4">
                  <Brain className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Driver Matching</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Machine learning algorithms that match the best available drivers to delivery opportunities.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Skill-based matching</li>
                  <li>• Location optimization</li>
                  <li>• Performance analytics</li>
                </ul>
              </CardContent>
            </Card>

            <Card className="glass shadow-retina border-orange-200 hover:shadow-retina-lg transition-retina">
              <CardHeader>
                <div className="w-12 h-12 deploy-gradient rounded-xl flex items-center justify-center mb-4">
                  <Rocket className="h-6 w-6 text-white" />
                </div>
                <CardTitle>Process Automation</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-gray-600 mb-4">
                  Automated workflows for onboarding, compliance checking, and job assignment processes.
                </p>
                <ul className="space-y-2 text-sm text-gray-700">
                  <li>• Document verification</li>
                  <li>• Compliance monitoring</li>
                  <li>• Automated billing</li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Subsidiary Services */}
      <section className="py-16">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">Supporting Services</h2>
            <p className="text-xl text-gray-600">Comprehensive solutions across the ACHIEVEMOR ecosystem</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {subsidiaryServices.map((service, index) => (
              <Card key={service.name} className="glass shadow-retina hover:shadow-retina-lg transition-retina text-center">
                <CardHeader>
                  <div className="flex justify-center mb-4">
                    {service.icon}
                  </div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600 text-sm mb-2">{service.description}</p>
                  <Badge variant="outline" className="text-xs">
                    {service.focus}
                  </Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Mission Statement */}
      <section className="py-16 bg-gradient-to-r from-blue-900 via-purple-900 to-indigo-900 text-white">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold mb-8">Our Mission</h2>
          <p className="text-xl leading-relaxed mb-8">
            At ACHIEVEMOR, we're pioneering the convergence of sports, education, and technology. 
            Our integrated ecosystem transforms how individuals connect, learn, and thrive, creating 
            limitless opportunities through innovative platforms and AI-powered solutions.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-12">
            <div>
              <div className="text-3xl font-bold text-orange-400 mb-2">2025</div>
              <div className="text-sm text-gray-300">Founded & Established</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-blue-400 mb-2">4+</div>
              <div className="text-sm text-gray-300">Active Platforms</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-purple-400 mb-2">100+</div>
              <div className="text-sm text-gray-300">Community Members</div>
            </div>
          </div>
        </div>
      </section>

      {/* Contact & CTA */}
      <section className="py-16">
        <div className="max-w-4xl mx-auto px-4 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Join the Ecosystem</h2>
          <p className="text-xl text-gray-600 mb-8">
            Experience the future of integrated technology solutions with ACHIEVEMOR
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="bg-primary hover:bg-primary/90">
              <Link href="/register/contractor">Join as Driver</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/register/company">Partner with Us</Link>
            </Button>
          </div>
          
          <div className="mt-12 pt-8 border-t border-gray-200">
            <div className="flex flex-col md:flex-row justify-center items-center space-y-4 md:space-y-0 md:space-x-8 text-gray-600">
              <div className="flex items-center space-x-2">
                <Building2 className="h-4 w-4" />
                <span>Pooler, GA 31322</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>(912) 742-9459</span>
              </div>
              <div className="flex items-center space-x-2">
                <span>delivered@byachievemor.com</span>
              </div>
              <a 
                href="https://achvmr-forms.paperform.co/" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center space-x-2 text-primary hover:text-primary/80 transition-colors"
              >
                <span>→ Needs Assessment</span>
              </a>
            </div>
          </div>
        </div>
      </section>

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