import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

// Interface atualizada para corresponder aos dados do Supabase
interface Lead {
  id: string; // UUID é uma string
  lead_score: number;
  interest_type: string;
  location: string;
  description: string;
  price_minimum: number;
  ends_at: string; // Supabase envia timestamptz como string
}

interface AuctionCardProps {
  auction: Lead; // Renomeado para 'auction' para manter o resto do código, mas usando nossa interface 'Lead'
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      // Converte a string de data do Supabase para um objeto Date
      const endTime = new Date(auction.ends_at).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        
        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else {
          setTimeLeft(`${hours}h ${minutes}m`);
        }
      } else {
        setTimeLeft('Auction Ended');
      }
    };

    // Calcula imediatamente e depois a cada segundo
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    // Limpa o timer quando o componente é desmontado
    return () => clearInterval(timer);
  }, [auction.ends_at]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-AU', {
      style: 'currency',
      currency: 'AUD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 85) return 'bg-green-500';
    if (score >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  // Funções de clique (manteremos a lógica para depois)
  const handlePlaceBid = () => console.log(`Placing bid for lead ${auction.id}`);
  const handleBuyNow = () => console.log(`Buy now for lead ${auction.id}`);

  return (
    <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-12 h-12 rounded-full ${getScoreColor(auction.lead_score)} flex items-center justify-center text-white font-bold text-sm`}>
          {auction.lead_score}
        </div>
      </div>

      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4 pr-16">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {auction.interest_type}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {auction.location}
          </p>
        </div>

        <div className="mb-4 flex-grow">
          <p className="text-sm text-gray-700 line-clamp-3">
            {auction.description}
          </p>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Minimum Price:</span>
            <span className="text-sm font-medium">{formatCurrency(auction.price_minimum)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid:</span>
            <span className="text-sm font-semibold text-green-600">--</span>
          </div>
        </div>

        <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Time Remaining</p>
          <p className="text-lg font-bold text-blue-600">
            {timeLeft}
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button onClick={handlePlaceBid} variant="outline" className="w-full">
            Place Bid
          </Button>
          <Button onClick={handleBuyNow} className="w-full">
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};