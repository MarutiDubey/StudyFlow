import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import OptionWheel from './ui/OptionWheel';

const profileData = [
  { label: 'Name', value: 'Manthan Dubey' },
  { label: 'Course', value: 'Master of computer application' },
  { label: 'Contact', value: '9244994354' },
  { label: 'E-Mail', value: 'dubeymanthan007@gmail.com' },
  { label: 'Batch', value: '2027' },
  { label: 'Resume', link: 'https://drive.google.com/file/d/1wMVlwdUvME0QmVaktm41-kbtxKfcR3Rk/view?usp=drive_link', linkText: 'View Resume' },
  { label: 'GitHub', link: 'https://github.com/MarutiDubey', linkText: 'Visit GitHub' },
  { label: 'Project Repo', link: 'https://github.com/MarutiDubey/StudyFlow', linkText: 'View Repository' },
  { label: 'LeetCode', link: 'https://leetcode.com/u/KRATOS0007/', linkText: 'View LeetCode' },
  { label: 'LinkedIn', link: 'https://www.linkedin.com/in/manthandubey', linkText: 'Connect on LinkedIn' }
];

export default function ProfileModal({ isOpen, onClose }) {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectedItem = profileData[selectedIndex];
  const labels = profileData.map(item => item.label);

  // Lock body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 md:p-8"
        >
          {/* Close Area (Click outside to close) */}
          <div className="absolute inset-0" onClick={onClose} />

          {/* Modal Container */}
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="relative w-[95%] md:w-full max-w-4xl h-[90vh] md:h-[600px] max-h-[85vh] bg-[#0a0a0a] border border-white/10 rounded-3xl shadow-2xl overflow-hidden flex flex-col md:flex-row"
          >
            {/* Close Button */}
            <button
              onClick={onClose}
              className="absolute top-4 right-4 z-50 w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/20 border border-white/10 text-white transition-colors"
            >
              ✕
            </button>

            {/* Left/Top Area: OptionWheel */}
            <div className="w-full md:w-[350px] relative border-b md:border-b-0 md:border-r border-white/10 h-[250px] md:h-auto md:min-h-[300px] shrink-0">
              <div className="absolute top-6 left-6 z-10">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase mb-1">Developer Profile</h2>
                <p className="text-sm text-gray-500 font-mono">Assignment</p>
              </div>
              <OptionWheel
                items={labels}
                defaultSelected={0}
                onChange={(index) => setSelectedIndex(index)}
                textColor="#666666"
                activeColor="#ffffff"
                fontSize={2.5}
                spacing={1.4}
                curve={1.2}
                tilt={8}
                fade={0.3}
                blur={2.5}
                smoothing={140}
                inset={40}
                soundUrl="https://assets.mixkit.co/active_storage/sfx/2568/2568-preview.mp3"
                soundVolume={0.3}
              />
            </div>

            {/* Right/Bottom Area: Details Pane */}
            <div className="flex-1 bg-[#111111] p-6 md:p-10 flex flex-col justify-center relative min-w-0 overflow-y-auto">
              <motion.div
                key={selectedIndex}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.2 }}
                className="flex flex-col items-start"
              >
                <div className="text-xs font-bold text-gray-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
                  <span className="w-4 h-[2px] bg-purple-500 inline-block" />
                  {selectedItem.label}
                </div>
                
                {selectedItem.link ? (
                  <a 
                    href={selectedItem.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 md:gap-4 bg-white hover:bg-gray-200 border-2 border-black text-black font-bold rounded-full shadow-[0_4px_16px_rgba(255,255,255,0.1)] transition-all hover:scale-105 text-sm md:text-lg uppercase tracking-wider whitespace-nowrap flex-shrink-0 px-6 py-4 md:px-12 md:py-5"
                  >
                    <span>{selectedItem.linkText}</span>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <line x1="7" y1="17" x2="17" y2="7"></line>
                      <polyline points="7 7 17 7 17 17"></polyline>
                    </svg>
                  </a>
                ) : (
                  <div className="text-2xl md:text-3xl font-bold text-white leading-tight break-all md:break-words w-full">
                    {selectedItem.value}
                  </div>
                )}
              </motion.div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
