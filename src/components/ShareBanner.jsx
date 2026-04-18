import React from 'react';
import { motion } from 'framer-motion';
import { 
  FaFacebookF, 
  FaXTwitter, 
  FaFacebookMessenger, 
  FaRedditAlien, 
  FaWhatsapp, 
  FaTelegram
} from 'react-icons/fa6'; // Notice 'fa6' to get the latest X logo!

const ShareBanner = () => {
  // Mock data for the share buttons just like your screenshot
  const shareLinks = [
    { name: 'Facebook', icon: FaFacebookF, count: '2.9k', hoverColor: 'hover:bg-[#1877F2] hover:border-[#1877F2]' },
    { name: 'X', icon: FaXTwitter, count: '1.7k', hoverColor: 'hover:bg-white hover:text-black hover:border-white' },
    { name: 'Messenger', icon: FaFacebookMessenger, count: '1.5k', hoverColor: 'hover:bg-[#00B2FF] hover:border-[#00B2FF]' },
    { name: 'Reddit', icon: FaRedditAlien, count: '2.6k', hoverColor: 'hover:bg-[#FF4500] hover:border-[#FF4500]' },
    { name: 'WhatsApp', icon: FaWhatsapp, count: '157', hoverColor: 'hover:bg-[#25D366] hover:border-[#25D366]' },
    { name: 'Telegram', icon: FaTelegram, count: '89', hoverColor: 'hover:bg-[#0088cc] hover:border-[#0088cc]' },
  ];

  return (
    <section className="max-w-[1400px] mx-auto px-6 md:px-6 py-12 relative z-20 mb-8">
      
      {/* Dashed Container */}
      <div className="flex flex-col lg:flex-row items-center justify-between p-6 md:px-10 border border-dashed border-gray-700 rounded bg-black/40 backdrop-blur-sm">
        
        {/* Left Side: Call to Action */}
        <div className="text-xl md:text-2xl font-cinematic tracking-widest text-gray-400 mb-6 lg:mb-0 text-center lg:text-left whitespace-nowrap">
          LOVE IT? <span className="font-bold text-white">SHARE IT!</span>
        </div>

        {/* Right Side: Share Buttons & Total Count */}
        <div className="flex flex-wrap items-center justify-center lg:justify-end gap-4 w-full">
          
          {/* Total Shares Counter */}
          <div className="flex flex-col items-center mr-2 md:mr-4">
            <span className="text-aiAccent font-black text-xl leading-none">10k</span>
            <span className="text-gray-500 text-[10px] uppercase tracking-widest mt-1">Shares</span>
          </div>

          {/* Social Buttons */}
          <div className="flex flex-wrap items-center justify-center gap-3">
            {shareLinks.map((social, index) => (
              <motion.button
                key={social.name}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`flex items-center gap-3 px-5 py-2.5 rounded-full border border-gray-700 bg-vfxBlack text-gray-300 transition-all duration-300 group ${social.hoverColor}`}
              >
                <social.icon className="w-4 h-4 group-hover:text-white transition-colors" />
                {social.count && (
                  <span className="text-sm font-semibold group-hover:text-white transition-colors">
                    {social.count}
                  </span>
                )}
              </motion.button>
            ))}
          </div>

        </div>
      </div>
    </section>
  );
};

export default ShareBanner;