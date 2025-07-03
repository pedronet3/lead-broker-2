import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogClose } from "@/components/ui/dialog";
import { toast } from '@/hooks/use-toast';

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
  const [selectedBidAmount, setSelectedBidAmount] = useState<number | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchHighestBid = async () => {
    const { data } = await supabase.from('bids').select('amount').eq('lead_id', auction.id).order('amount', { ascending: false }).limit(1).single();
    if (data) { setCurrentBid(data.amount); } else { setCurrentBid(null); }
  };

  useEffect(() => {
    const calculateTimeLeft = () => {
      const endTime = new Date(auction.ends_at).getTime();
      const now = new Date().getTime();
      const difference = endTime - now;
      if (difference > 0) {
        const days = Math.floor(difference / (1000 * 60 * 60 * 24));
        const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
        if (days > 0) setTimeLeft(`${days}d ${hours}h ${minutes}m`); else setTimeLeft(`${hours}h ${minutes}m`);
      } else { setTimeLeft('Auction Ended'); }
    };
    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);
    return () => clearInterval(timer);
  }, [auction.ends_at]);

  useEffect(() => {
    fetchHighestBid(); 
    const channel = supabase.channel(`bids-for-lead-${auction.id}`).on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'bids', filter: `lead_id=eq.${auction.id}` }, (payload) => { fetchHighestBid(); }).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [auction.id]);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-AU', { style: 'currency', currency: 'AUD', minimumFractionDigits: 0 }).format(amount);
  const getScoreColor = (score: number) => { if (score >= 85) return 'bg-green-500'; if (score >= 70) return 'bg-yellow-500'; return 'bg-red-500'; };
  
  const baseBid = currentBid || auction.price_minimum;
  const bidOptions = [
    { percentage: '10%', value: Math.ceil(baseBid * 1.1), color: 'bg-red-100 hover:bg-red-200' },
    { percentage: '20%', value: Math.ceil(baseBid * 1.2), color: 'bg-orange-100 hover:bg-orange-200' },
    { percentage: '30%', value: Math.ceil(baseBid * 1.3), color: 'bg-green-100 hover:bg-green-200' },
  ];

  const handleSubmitBid = async () => {
    if (!selectedBidAmount) return;
    setIsSubmitting(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) { toast({ title: "Authentication Error", description: "You must be logged in to place a bid.", variant: "destructive" }); setIsSubmitting(false); return; }
    const { error } = await supabase.from('bids').insert({ lead_id: auction.id, partner_id: user.id, amount: selectedBidAmount });
    if (error) { toast({ title: "Bid Failed", description: error.message, variant: "destructive" }); } 
    else { toast({ title: "Bid Placed!", description: `Your bid of ${formatCurrency(selectedBidAmount)} was successful.` }); }
    setIsSubmitting(false);
    setIsModalOpen(false);
    setSelectedBidAmount(null);
  };

  const handleBuyNow = async () => {
    setIsSubmitting(true);
    const { data, error } = await supabase.functions.invoke('buy-now', {
      body: { lead_id: auction.id },
    });
    if (error) {
      toast({ title: "Buy Now Failed", description: error.message, variant: "destructive" });
    } else {
      const buyNowPriceValue = currentBid ? currentBid * 1.5 : auction.price_minimum * 1.5;
      toast({ title: "Purchase Successful!", description: `Lead acquired for ${formatCurrency(buyNowPriceValue)}.` });
    }
    setIsSubmitting(false);
  };
  
  const buyNowPrice = currentBid ? currentBid * 1.5 : auction.price_minimum * 1.5;

  return (
    <Card className="relative h-full flex flex-col hover:shadow-lg transition-shadow">
      <div className="absolute top-4 right-4 z-10"><div className={`w-12 h-12 rounded-full ${getScoreColor(auction.lead_score)} flex items-center justify-center text-white font-bold text-sm`}>{auction.lead_score}</div></div>
      <CardContent className="p-6 flex flex-col h-full">
        <div className="mb-4 pr-16"><h3 className="text-lg font-semibold text-gray-900 mb-2">{auction.interest_type}</h3><p className="text-sm text-gray-600 mb-3">{auction.location}</p></div>
        <div className="mb-4 flex-grow"><p className="text-sm text-gray-700 line-clamp-3">{auction.description}</p></div>
        <div className="space-y-3 mb-4"><div className="flex justify-between items-center"><span className="text-sm text-gray-600">Minimum Price:</span><span className="text-sm font-medium">{formatCurrency(auction.price_minimum)}</span></div><div className="flex justify-between items-center"><span className="text-sm text-gray-600">Current Bid:</span><span className="text-sm font-semibold text-green-600">{currentBid ? formatCurrency(currentBid) : '--'}</span></div></div>
        <div className="mb-6 p-3 bg-blue-50 rounded-lg text-center"><p className="text-xs text-gray-600 mb-1">Time Remaining</p><p className="text-lg font-bold text-blue-600">{timeLeft}</p></div>
        
        <div className="grid grid-cols-2 gap-3 mt-auto">
          <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
            <DialogTrigger asChild><Button variant="outline" className="w-full">Place Bid</Button></DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
              <DialogHeader><DialogTitle>Place Your Bid</DialogTitle></DialogHeader>
              <div className="py-4 space-y-4">
                <div className="text-center p-2 rounded-md bg-gray-100"><p className="text-sm text-gray-600">Current Bid: <span className="font-bold">{formatCurrency(baseBid)}</span></p><p className="text-sm text-gray-600">Time Remaining: <span className="font-bold">{timeLeft}</span></p></div>
                <div className="space-y-2">
                  {bidOptions.map((option) => (
                    <Button key={option.percentage} variant="ghost" className={`w-full justify-between h-12 text-md ${option.color} ${selectedBidAmount === option.value ? 'ring-2 ring-blue-500' : ''}`} onClick={() => setSelectedBidAmount(option.value)}>
                      <span>Increase by {option.percentage}</span><span className="font-bold">{formatCurrency(option.value)}</span>
                    </Button>
                  ))}
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
                <Button onClick={handleSubmitBid} disabled={!selectedBidAmount || isSubmitting}>{isSubmitting ? 'Placing Bid...' : 'Place Bid'}</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          
          <Button onClick={handleBuyNow} className="w-full" disabled={isSubmitting}>
            {isSubmitting ? 'Processing...' : `Buy Now for ${formatCurrency(buyNowPrice)}`}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};