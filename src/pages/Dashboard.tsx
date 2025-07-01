
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { AuctionCard } from '@/components/AuctionCard';

// Mock auction data for demonstration
const mockAuctions = [
  {
    id: 1,
    leadScore: 85,
    interestType: "Residential Property",
    location: "San Francisco, CA",
    description: "Beautiful 3-bedroom home in prime location with modern amenities and stunning city views.",
    minimumPrice: 750000,
    currentBid: 825000,
    timeRemaining: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000), // 2 days from now
  },
  {
    id: 2,
    leadScore: 92,
    interestType: "Commercial Space",
    location: "New York, NY",
    description: "Prime retail space in Manhattan's financial district, perfect for high-end boutique or restaurant.",
    minimumPrice: 1200000,
    currentBid: 1350000,
    timeRemaining: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
  },
  {
    id: 3,
    leadScore: 78,
    interestType: "Investment Property",
    location: "Austin, TX",
    description: "Multi-unit apartment complex with excellent rental history and growth potential.",
    minimumPrice: 950000,
    currentBid: 980000,
    timeRemaining: new Date(Date.now() + 1 * 24 * 60 * 60 * 1000), // 1 day from now
  },
  {
    id: 4,
    leadScore: 88,
    interestType: "Luxury Condo",
    location: "Miami, FL",
    description: "Oceanfront luxury condominium with private balcony and resort-style amenities.",
    minimumPrice: 1800000,
    currentBid: 1950000,
    timeRemaining: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 days from now
  },
];

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session?.user) {
        navigate('/login');
        return;
      }
      
      setUser(session.user);
      setIsLoading(false);
    };

    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          navigate('/login');
        } else {
          setUser(session.user);
        }
      }
    );

    return () => subscription.unsubscribe();
  }, [navigate]);

  const handleSignOut = async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        toast({
          title: "Sign Out Failed",
          description: error.message,
          variant: "destructive",
        });
      } else {
        toast({
          title: "Signed Out",
          description: "You have been successfully signed out.",
        });
        navigate('/login');
      }
    } catch (error) {
      toast({
        title: "Sign Out Failed",
        description: "An unexpected error occurred.",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">
            Sign Out
          </Button>
        </div>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Welcome back!</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-gray-600 mb-2">
              You are logged in as: <strong>{user?.email}</strong>
            </p>
          </CardContent>
        </Card>

        <Tabs defaultValue="active-auctions" className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:w-[400px]">
            <TabsTrigger value="active-auctions">Active Auctions</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active-auctions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {mockAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;
