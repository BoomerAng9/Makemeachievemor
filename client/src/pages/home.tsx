import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { UniversalNav } from "@/components/UniversalNav";

export default function HomePage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    note: ""
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
    console.log("Form submitted:", formData);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <div className="min-h-screen bg-white">
      <UniversalNav />
      
      <main className="container mx-auto px-4 py-8">
        {/* Services Section */}
        <div className="grid md:grid-cols-3 gap-8 mb-12">
          <Card className="text-center">
            <CardContent className="p-6">
              <img 
                src="https://byachievemor.com/images/s-boxtruck.jpg" 
                alt="RELIABLE TRANSPORTATION"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h5 className="text-lg font-bold mb-4 text-gray-900">RELIABLE TRANSPORTATION</h5>
              <p className="text-gray-600">
                Trust is paramount in our industry, and our commitment is steadfast. We're committed to providing dependable transportation, ensuring your cargo is safe and on time. Every journey, every load, we prioritize reliability.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <img 
                src="https://byachievemor.com/images/s-phone.jpg" 
                alt="DEDICATED CUSTOMER SUPPORT"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h5 className="text-lg font-bold mb-4 text-gray-900">DEDICATED CUSTOMER SUPPORT</h5>
              <p className="text-gray-600">
                Our customers are the backbone of our business. That's why we're dedicated to providing professional and responsive support. Whether you have a query, need an update, or face any unforeseen challenges, we're just a call away.
              </p>
            </CardContent>
          </Card>

          <Card className="text-center">
            <CardContent className="p-6">
              <img 
                src="https://byachievemor.com/images/s-charts.jpg" 
                alt="COST-EFFECTIVE SOLUTIONS"
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
              <h5 className="text-lg font-bold mb-4 text-gray-900">COST-EFFECTIVE SOLUTIONS</h5>
              <p className="text-gray-600">
                Quality service doesn't have to break the bank. We pride ourselves on offering transportation that is both dependable and affordable. Our strategic approach allows us to provide top-tier services at competitive prices.
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Contact Form Section */}
        <div className="max-w-2xl mx-auto mb-12">
          <h2 className="text-2xl font-bold text-center mb-8">Drop Us A Line</h2>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-2">
                Your Name * Required
              </label>
              <Input
                id="name"
                name="name"
                type="text"
                required
                value={formData.name}
                onChange={handleChange}
                placeholder="This field is required"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email * Required
              </label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="Please enter a valid email address."
              />
            </div>

            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-2">
                Phone
              </label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                value={formData.phone}
                onChange={handleChange}
                placeholder="Please enter a valid 10 digit phone number"
              />
            </div>

            <div>
              <label htmlFor="note" className="block text-sm font-medium text-gray-700 mb-2">
                Note * Required
              </label>
              <Textarea
                id="note"
                name="note"
                required
                value={formData.note}
                onChange={handleChange}
                placeholder="This field is required"
                rows={4}
              />
            </div>

            <Button type="submit" className="w-full">
              Submit
            </Button>
          </form>
        </div>

        {/* Company Information */}
        <div className="grid md:grid-cols-3 gap-8">
          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-4">ACHIEVEMOR LLC</h4>
              <p className="text-gray-600">
                Your trusted partner in transportation. We're committed to excellent customer service and getting your cargo to its destination safely and on time.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-4">By The Numbers</h4>
              <div className="space-y-2 text-gray-600">
                <p><strong>DOT Number:</strong> 4398142</p>
                <p><strong>MC #:</strong> 1726115</p>
                <p><strong>BOC-3 #:</strong> EVILSIZOR PROCESS SERVERS LLC</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h4 className="text-xl font-bold mb-4">Get In Touch</h4>
              <div className="space-y-2 text-gray-600">
                <p>275 LONGLEAF CIR</p>
                <p>POOLER, GA 31322</p>
                <p>(912) 742-9459</p>
                <p>Delivered@byachievemor.com</p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 py-8 border-t border-gray-200">
          <p className="text-gray-600 font-medium">ACHIEVEMOR LLC</p>
        </div>
      </main>
    </div>
  );
}