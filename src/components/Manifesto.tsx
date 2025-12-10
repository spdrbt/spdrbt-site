'use client';

import { motion } from 'framer-motion';

export function Manifesto() {
  const paragraphs = [
    <>The <strong>SPDR-BT</strong> network was deployed to upgrade the connectivity of New York.</>,
    <>Hidden in plain sight, these magnetic nodes serve as anchors for those with the spider-sense to locate them.</>,
    <>They are gateways to a dual interface: scanning the QR reveals your specific Spider-Identity via AR protocols, while the NFC link grants access to this terminal—a hub for vital, real-time civic data.</>,
    <>This system is a superior evolution of the city&apos;s infrastructure, designed to help the populace master their environment.</>,
  ];

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay: 0.5 }}
      className="mt-10 p-6 md:p-8 text-center border-t-2 border-[#7a0000] text-[#ff8a8a] font-mono text-sm md:text-base leading-relaxed max-w-4xl mx-auto bg-[rgba(25,0,0,0.4)] rounded border border-[#590000] shadow-[0_0_20px_rgba(0,0,0,0.5)]"
    >
      {paragraphs.map((text, index) => (
        <motion.p
          key={index}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 + index * 0.15 }}
          className="mb-6 last:mb-0"
          style={{ textWrap: 'balance' } as React.CSSProperties}
        >
          {text}
        </motion.p>
      ))}
    </motion.div>
  );
}
