import { Instagram, Send, Phone, CreditCard, Landmark } from 'lucide-react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <Link href="/" className="flex items-center gap-2 mb-6">
            <div className="w-10 h-10 rounded-xl overflow-hidden border border-white/10">
              <img src="/toy.jpg" alt="Logo" className="w-full h-full object-cover" />
            </div>
            <span className="text-2xl font-display font-bold tracking-tight">
              PleasureToys <span className="text-primary">GH</span>
            </span>
          </Link>
          <p className="text-white/40 max-w-sm leading-relaxed mb-8">
            Ghana's premier destination for high-quality adult toys and sensual accessories. We prioritize your pleasure and privacy with 100% discreet packaging and delivery.
          </p>
          <address className="not-italic text-white/40 text-xs leading-relaxed mb-8 block">
            <span className="font-bold text-white block mb-1">PleasureToysGH</span>
            Majesty Road (GA-577), off Olebu Amamoley Road, Ablekuma,<br />
            Accra, Ga Central Municipal District, Greater Accra, Ghana<br />
            Digital Address: GW-0635-6571<br />
            Phone: <a href="tel:+233266181581" className="text-white/60 hover:text-primary transition-colors">0266 181 581</a>
          </address>
          <div className="flex flex-col gap-6">
            <div className="flex gap-4">
              {[
                { Icon: Instagram, href: "https://www.instagram.com/pleasuretoys.gh", target: "_blank" },
                { Icon: Send, href: "https://t.me/pleasuretoysgh", target: "_blank" },
              ].map(({ Icon, href, target }, i) => (
                <a
                  key={i}
                  href={href}
                  target={target}
                  rel={target === "_blank" ? "noopener noreferrer" : undefined}
                  className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center hover:bg-primary hover:border-primary transition-all"
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>
            <a href="tel:+233266181581" className="inline-flex items-center gap-3 text-white/60 hover:text-primary transition-colors group">
              <div className="w-10 h-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-primary group-hover:border-primary transition-all">
                <Phone size={18} />
              </div>
              <span className="font-medium tracking-wide">0266181581</span>
            </a>
          </div>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Categories</h4>
          <ul className="space-y-4 text-white/60">
            <li><Link href="/category/Vibrators" className="hover:text-primary transition-colors">Vibrators</Link></li>
            <li><Link href="/category/BDSM" className="hover:text-primary transition-colors">BDSM & Bondage</Link></li>
            <li><Link href="/category/Lubricants" className="hover:text-primary transition-colors">Lubricants</Link></li>
            <li><Link href="/category/Accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Information</h4>
          <ul className="space-y-4 text-white/60">
            <li><Link href="/guides" className="hover:text-primary transition-colors">Guides</Link></li>
            <li><Link href="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link href="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link href="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link href="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Secure Payments</h4>
          <p className="text-white/40 text-[10px] uppercase tracking-widest mb-4">Cards, MoMo & Bank Transfer</p>
          <div className="flex flex-col gap-3">
            <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group">
              <div className="w-14 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-inner">
                <img src="/mtn.jpg" alt="MTN MoMo" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">MTN MoMo</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group">
              <div className="w-14 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-inner">
                <img src="/airteltigo.jpg" alt="Airtel Tigo Money" className="w-full h-full object-contain transition-transform group-hover:scale-110" />
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">AT Money</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group">
              <div className="w-14 h-10 bg-white rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center p-1 shadow-inner gap-0.5">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 86 54" className="h-3.5 w-auto" aria-label="Visa">
                  <rect width="86" height="54" rx="4" fill="white" stroke="#1A1F71" strokeWidth="2"/>
                  <rect x="0" y="8" width="86" height="12" fill="#1A1F71"/>
                  <rect x="0" y="42" width="86" height="10" fill="#F7A800"/>
                  <text x="43" y="37" textAnchor="middle" fill="#1A1F71" fontFamily="Arial Black, Arial" fontWeight="900" fontSize="18" letterSpacing="1">VISA</text>
                </svg>
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 90 54" className="h-3.5 w-auto" aria-label="Mastercard">
                  <circle cx="32" cy="27" r="22" fill="#CC0000"/>
                  <circle cx="58" cy="27" r="22" fill="#FF9900"/>
                  <path d="M45 10.2a22 22 0 010 33.6A22 22 0 0145 10.2z" fill="#FF6600"/>
                  <text x="45" y="30" textAnchor="middle" fill="white" fontFamily="Arial, sans-serif" fontWeight="bold" fontSize="10" letterSpacing="0.3">MasterCard</text>
                </svg>
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">Cards / Paystack</span>
            </div>
            <div className="flex items-center gap-3 p-2.5 bg-white/5 border border-white/10 rounded-2xl hover:border-white/20 transition-colors group">
              <div className="w-14 h-10 bg-emerald-500/10 text-emerald-400 rounded-lg overflow-hidden flex-shrink-0 flex items-center justify-center shadow-inner">
                <Landmark className="w-5 h-5" />
              </div>
              <span className="text-xs font-bold text-white/60 uppercase tracking-wider group-hover:text-white transition-colors">Bank Transfer</span>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-xs font-medium uppercase tracking-widest">
        <p>© 2026 PleasureToys GH. All rights reserved.</p>
        <p>Designed with Passion in Ghana</p>
      </div>
    </footer>
  );
}
