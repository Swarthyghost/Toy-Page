import React from 'react';
import { motion } from 'motion/react';
import { Mail, Phone, MapPin, Send } from 'lucide-react';

export default function Contact() {
  return (
    <div className="max-w-7xl mx-auto px-6 py-24">
      <div className="grid lg:grid-cols-2 gap-16">
        <div>
          <h1 className="text-6xl font-display font-bold mb-8">Get in Touch</h1>
          <p className="text-xl text-white/60 mb-12 leading-relaxed">
            Have questions about our products or your order? We're here to help. Reach out to us through any of these channels.
          </p>

          <div className="space-y-8">
            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Phone className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Call / WhatsApp</div>
                <div className="text-xl font-bold">+233 26 618 1581</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <Mail className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Email</div>
                <div className="text-xl font-bold">hello@pleasuretoysgh.com</div>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="w-14 h-14 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0">
                <MapPin className="text-primary" size={24} />
              </div>
              <div>
                <div className="text-sm font-bold uppercase tracking-widest text-white/40 mb-1">Location</div>
                <div className="text-xl font-bold">Accra, Ghana (Online Only)</div>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white/5 border border-white/10 rounded-[3rem] p-10">
          <form className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Name</label>
                <input
                  type="text"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Email</label>
                <input
                  type="email"
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors"
                />
              </div>
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-white/40 ml-1">Message</label>
              <textarea
                className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:border-primary focus:outline-none transition-colors min-h-[150px] resize-none"
              />
            </div>
            <button className="w-full py-5 bg-primary text-white font-bold rounded-2xl flex items-center justify-center gap-2 hover:scale-[1.02] active:scale-95 transition-all">
              Send Message
              <Send size={20} />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
