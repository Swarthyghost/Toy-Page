import { Instagram, Twitter, Facebook } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-zinc-950 border-t border-white/5 pt-20 pb-10 px-6">
      <div className="max-w-7xl mx-auto grid md:grid-cols-4 gap-12 mb-16">
        <div className="col-span-2">
          <Link to="/" className="flex items-center gap-2 mb-6">
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
          <div className="flex gap-4">
            {[
              { Icon: Instagram, href: "https://www.instagram.com/pleasuretoys_gh", target: "_blank" },
              { Icon: Twitter, href: "#", target: undefined },
              { Icon: Facebook, href: "#", target: undefined },
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
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Categories</h4>
          <ul className="space-y-4 text-white/60">
            <li><Link to="/category/Vibrators" className="hover:text-primary transition-colors">Vibrators</Link></li>
            <li><Link to="/category/BDSM" className="hover:text-primary transition-colors">BDSM & Bondage</Link></li>
            <li><Link to="/category/Lubricants" className="hover:text-primary transition-colors">Lubricants</Link></li>
            <li><Link to="/category/Accessories" className="hover:text-primary transition-colors">Accessories</Link></li>
          </ul>
        </div>

        <div>
          <h4 className="font-bold mb-6 uppercase tracking-widest text-xs text-white/40">Information</h4>
          <ul className="space-y-4 text-white/60">
            <li><Link to="/about" className="hover:text-primary transition-colors">Our Story</Link></li>
            <li><Link to="/shipping" className="hover:text-primary transition-colors">Shipping & Returns</Link></li>
            <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            <li><Link to="/contact" className="hover:text-primary transition-colors">Contact Us</Link></li>
            <li><Link to="/admin" className="hover:text-primary transition-colors">Admin Portal</Link></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4 text-white/20 text-xs font-medium uppercase tracking-widest">
        <p>© 2024 PleasureToys GH. All rights reserved.</p>
        <p>Designed with Passion in Ghana</p>
      </div>
    </footer>
  );
}
