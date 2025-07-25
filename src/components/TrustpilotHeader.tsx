import React from 'react';
import trustpilotLogo from '/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png';

interface TrustpilotHeaderProps {
  className?: string;
}

const TrustpilotHeader: React.FC<TrustpilotHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`flex justify-end items-center ${className}`}>
      <img 
        src={trustpilotLogo} 
        alt="Trustpilot 5 stars" 
        className="h-10 sm:h-12 w-auto"
      />
    </div>
  );
};

export default TrustpilotHeader;