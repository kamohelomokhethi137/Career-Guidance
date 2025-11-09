import React from 'react';
import { motion } from 'framer-motion';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-black text-gray-400 py-6">
      <motion.div
        className="max-w-7xl mx-auto px-4 text-center"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: "easeOut" }}
        viewport={{ once: true }}
      >
        <p className="text-sm tracking-wide">
          © {currentYear} CareerGuide Lesotho. All rights reserved.
        </p>
      </motion.div>
    </footer>
  );
};

export default Footer;
