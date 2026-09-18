import React from 'react'
import { Link } from 'react-router-dom'
import { Shield, Network, Zap, Lock } from 'lucide-react'

export default function Landing() {
  return (
    <div className="min-h-screen bg-background text-white flex flex-col items-center justify-center p-6 relative overflow-hidden">
      {/* Background Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-primary/20 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="z-10 text-center max-w-4xl space-y-8">
        <div className="flex items-center justify-center space-x-3 mb-6">
          <Shield className="w-16 h-16 text-primary" />
          <h1 className="text-6xl font-bold tracking-tighter">
            Crime<span className="text-primary">Petrol</span>
          </h1>
        </div>
        
        <p className="text-2xl text-gray-400 font-light max-w-2xl mx-auto">
          AI-Powered Criminal Network Analysis System. Connect the dots for a safer tomorrow.
        </p>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-12 pb-16">
          <FeatureCard icon={Network} title="Knowledge Graphs" desc="Instantly build relationship maps from raw intelligence." />
          <FeatureCard icon={Zap} title="Real-time Alerts" desc="Detect suspicious patterns and call bursts automatically." />
          <FeatureCard icon={Lock} title="Secure & Private" desc="Enterprise-grade security powered by Supabase and AES encryption." />
        </div>

        <Link 
          to="/auth" 
          className="inline-flex items-center px-8 py-4 bg-primary text-background font-semibold text-lg rounded-full hover:bg-primary/90 transition-all hover:scale-105 shadow-[0_0_20px_rgba(34,211,238,0.4)]"
        >
          Enter Intelligence Dashboard
        </Link>
      </div>
    </div>
  )
}

function FeatureCard({ icon: Icon, title, desc }) {
  return (
    <div className="bg-card/50 border border-border p-6 rounded-2xl backdrop-blur-sm text-left hover:border-primary/50 transition-colors">
      <Icon className="w-10 h-10 text-primary mb-4" />
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-gray-400">{desc}</p>
    </div>
  )
}
