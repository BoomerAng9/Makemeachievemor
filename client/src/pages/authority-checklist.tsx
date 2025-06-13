import { AuthorityChecklist } from "@/components/AuthorityChecklist";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageCircle } from "lucide-react";
import { Link } from "wouter";
import { useState } from "react";
import { Chatbot } from "@/components/ui/chatbot";

export default function AuthorityChecklistPage() {
  const [isChatbotOpen, setIsChatbotOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div className="flex items-center space-x-4">
            <Link href="/dashboard">
              <Button variant="outline" size="sm">
                <ArrowLeft className="h-4 w-4 mr-2" />
                Back to Dashboard
              </Button>
            </Link>
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
                Authority Setup Checklist
              </h1>
              <p className="text-gray-600 dark:text-gray-300">
                Your complete guide to getting DOT and MC authority
              </p>
            </div>
          </div>
          
          <Button
            onClick={() => setIsChatbotOpen(!isChatbotOpen)}
            className="flex items-center space-x-2"
          >
            <MessageCircle className="h-4 w-4" />
            <span>Get Help</span>
          </Button>
        </div>

        {/* Authority Checklist Component */}
        <AuthorityChecklist />
        
        {/* Additional Information */}
        <div className="mt-12 grid md:grid-cols-2 gap-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Getting Started Tips</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Start with business formation - you'll need an EIN for most other steps</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Budget $2,000-5,000 for initial setup costs including insurance</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Allow 30-45 days for complete authority processing</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-blue-500 font-bold">•</span>
                <span>Keep all documents organized - you'll need them for audits</span>
              </li>
            </ul>
          </div>
          
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm border">
            <h3 className="text-lg font-semibold mb-4">Common Mistakes to Avoid</h3>
            <ul className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Don't operate before receiving your MC authority number</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Never skip the BOC-3 process agent requirement</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Don't forget biennial MCS-150 updates (every 2 years)</span>
              </li>
              <li className="flex items-start space-x-2">
                <span className="text-red-500 font-bold">•</span>
                <span>Ensure insurance meets minimum requirements before filing</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
      
      {/* Chatbot */}
      <Chatbot 
        isOpen={isChatbotOpen} 
        onToggle={() => setIsChatbotOpen(!isChatbotOpen)}
        position="bottom-right"
      />
    </div>
  );
}