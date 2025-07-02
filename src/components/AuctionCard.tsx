import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';

interface Lead {
  id: string;
  lead_score: number;
  interest_type: string;
  location: string;
  description: string;
  price_minimum: number;
  ends_at: string;
}

interface AuctionCardProps {
  auction: Lead;
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');
  const [currentBid, setCurrentBid] = useState<number | null>(null);
  const [isBidModalOpen, setIsBidModalOpen] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
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

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction.ends_at]);

  useEffect(() => {
    const fetchHighestBid = async () => {
      const { data, error } = await supabase
        .from('bids')
        .select('amount')
        .eq('lead_id', auction.id)
        .order('amount', { ascending: false })
        .limit(1)
        .single();

      if (data) {
        setCurrentBid(data.amount);
      }
    };

    fetchHighestBid();
  }, [auction.id]);

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

  // --- NOVA LÓGICA AQUI ---
  const buyNowPrice = currentBid 
    ? currentBid * 1.5 
    : auction.price_minimum * 1.5;
  // --- FIM DA NOVA LÓGICA ---

  const handlePlaceBid = () => setIsBidModalOpen(true);
  const handleBuyNow = () => console.log(`Buy now for lead ${auction.id}`);
  
  const handleBidIncrement = (percentage: string) => {
    console.log(`Placing bid with ${percentage} increment for lead ${auction.id}`);
    setIsBidModalOpen(false);
  };

  return (
    <>
      <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow">
        <div className="absolute top-4 right-4 z-10">
          <div className={`w-12 h-12 rounded-full ${getScoreColor(auction.lead_score)} flex items-center justify-center text-white font-bold text-sm`}>
            {auction.lead_score}
          </div>
        </div>

        <CardContent className="p-6 flex flex-col h-full">
          {/* ... (código para interest_type, location, description, etc. continua o mesmo) ... */}
          <div className="mb-4 pr-16">
            <h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.interest_type}</h3>
            <p className="text-sm text-gray-600 mb-3">{auction.location}</p>
          </div>
          <div className="mb-4 flex-grow">
            <p className="text-sm text-gray-700 line-clamp-3">{auction.description}</p>
          </div>
          <div className="space-y-3 mb-4">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Minimum Price:</span>
              <span className="text-sm font-medium">{formatCurrency(auction.price_minimum)}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Current Bid:</span>
              <span className="text-sm font-semibold text-green-600">{currentBid ? formatCurrency(currentBid) : '--'}</span>
            </div>
          </div>
          <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
            <p className="text-xs text-gray-600 mb-1">Time Remaining</p>
            <p className="text-lg font-bold text-blue-600">{timeLeft}</p>
          </div>
          {/* --- FIM DO CÓDIGO INALTERADO --- */}

          {/* --- BOTÕES ATUALIZADOS --- */}
          <div className="grid grid-cols-2 gap-3 mt-auto">
            <Button onClick={handlePlaceBid} variant="outline" className="w-full">
              Place Bid
            </Button>
            <Button onClick={handleBuyNow} className="w-full">
              Buy Now for {formatCurrency(buyNowPrice)}
            </Button>
          </div>
        </CardContent>
      </Card>

      <Dialog open={isBidModalOpen} onOpenChange={setIsBidModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Place Your Bid</DialogTitle>
          </DialogHeader>
          
          <div className="space-y-3 py-4">
            <Button 
              onClick={() => handleBidIncrement('+10%')} 
              variant="outline" 
              className="w-full"
            >
              +10%
            </Button>
            <Button 
              onClick={() => handleBidIncrement('+20%')} 
              variant="outline" 
              className="w-full"
            >
              +20%
            </Button>
            <Button 
              onClick={() => handleBidIncrement('+30%')} 
              variant="outline" 
              className="w-full"
            >
              +30%
            </Button>
          </div>
          
          <Button 
            onClick={() => setIsBidModalOpen(false)} 
            variant="secondary" 
            className="w-full"
          >
            Cancel
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
};