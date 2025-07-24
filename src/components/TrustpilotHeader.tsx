import React from 'react';
import trustpilotLogo from '/lovable-uploads/4e4faf8a-b202-4101-a858-9c58ad0a28c5.png';

interface TrustpilotHeaderProps {
  className?: string;
}

const TrustpilotHeader: React.FC<TrustpilotHeaderProps> = ({ className = "" }) => {
  return (
    <div className={`flex justify-between items-center ${className}`}>
      <img 
        src="/lovable-uploads/ce43a78c-28ec-400b-8a16-1e98b15e0185.png" 
        alt="Buy a Warranty" 
        className="h-8 sm:h-10 w-auto"
      />
      <img 
        src={trustpilotLogo} 
        alt="Trustpilot 5 stars" 
        className="h-8 sm:h-10 w-auto"
      />
    </div>
  );
};

export default TrustpilotHeader;