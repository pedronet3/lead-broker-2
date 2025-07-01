
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

interface Auction {
  id: number;
  leadScore: number;
  interestType: string;
  location: string;
  description: string;
  minimumPrice: number;
  currentBid: number;
  timeRemaining: Date;
}

interface AuctionCardProps {
  auction: Auction;
}

export const AuctionCard = ({ auction }: AuctionCardProps) => {
  const [timeLeft, setTimeLeft] = useState<string>('');

  useEffect(() => {
    const calculateTimeLeft = () => {
      const now = new Date().getTime();
      const endTime = auction.timeRemaining.getTime();
      const difference = endTime - now;

      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((difference % (1000 * 60)) / 1000);

        if (days > 0) {
          setTimeLeft(`${days}d ${hours}h ${minutes}m`);
        } else if (hours > 0) {
          setTimeLeft(`${hours}h ${minutes}m ${seconds}s`);
        } else if (minutes > 0) {
          setTimeLeft(`${minutes}m ${seconds}s`);
        } else {
          setTimeLeft(`${seconds}s`);
        }
      } else {
        setTimeLeft('Auction Ended');
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [auction.timeRemaining]);

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const getScoreColor = (score: number) => {
    if (score >= 90) return 'bg-green-500';
    if (score >= 75) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const handlePlaceBid = () => {
    console.log(`Placing bid for auction ${auction.id}`);
    // TODO: Implement bid placement logic
  };

  const handleBuyNow = () => {
    console.log(`Buy now for auction ${auction.id}`);
    // TODO: Implement buy now logic
  };

  return (
    <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow">
      {/* Lead Score Circle */}
      <div className="absolute top-4 right-4 z-10">
        <div className={`w-12 h-12 rounded-full ${getScoreColor(auction.leadScore)} flex items-center justify-center text-white font-bold text-sm`}>
          {auction.leadScore}
        </div>
      </div>

      <CardContent className="p-6 flex flex-col h-full">
        {/* Interest Type and Location */}
        <div className="mb-4 pr-16">
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            {auction.interestType}
          </h3>
          <p className="text-sm text-gray-600 mb-3">
            {auction.location}
          </p>
        </div>

        {/* Description */}
        <div className="mb-4 flex-grow">
          <p className="text-sm text-gray-700 line-clamp-3">
            {auction.description}
          </p>
        </div>

        {/* Pricing Information */}
        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Minimum Price:</span>
            <span className="text-sm font-medium">{formatCurrency(auction.minimumPrice)}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600">Current Bid:</span>
            <span className="text-sm font-semibold text-green-600">{formatCurrency(auction.currentBid)}</span>
          </div>
        </div>

        {/* Time Remaining */}
        <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center">
          <p className="text-xs text-gray-600 mb-1">Time Remaining</p>
          <p className="text-lg font-bold text-blue-600">
            {timeLeft}
          </p>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Button 
            onClick={handlePlaceBid}
            variant="outline"
            className="w-full"
          >
            Place Bid
          </Button>
          <Button 
            onClick={handleBuyNow}
            className="w-full"
          >
            Buy Now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
