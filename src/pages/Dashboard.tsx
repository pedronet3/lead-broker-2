import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { AuctionCard } from '@/components/AuctionCard';

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [leads, setLeads] = useState<any[]>([]);
  const navigate = useNavigate();

  const fetchLeads = async () => {
    try {
      const { data, error } = await supabase
        .from('leads')
        .select('*')
        .eq('status', 'in_auction');

      if (error) {
        toast({
          title: "Error fetching leads",
          description: error.message,
          variant: "destructive",
        });
      } else if (data) {
        setLeads(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "An unexpected error occurred while fetching leads.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false); 
    }
  };

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        navigate('/login');
        return;
      }
      setUser(session.user);
      fetchLeads();
    };

    checkUser();

    // --- REALTIME SUBSCRIPTION START ---
    // This subscription listens for any changes in the 'leads' table.
    const leadsChannel = supabase
      .channel('public:leads')
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'leads' },
        (payload) => {
          console.log('Change received on leads table!', payload);
          // When a change occurs, re-fetch the list of leads.
          fetchLeads();
        }
      )
      .subscribe();
    // --- REALTIME SUBSCRIPTION END ---

    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        if (event === 'SIGNED_OUT' || !session?.user) {
          navigate('/login');
        } else {
          setUser(session.user);
        }
      }
    );

    // Cleanup function to remove all subscriptions when the component unmounts.
    return () => {
      supabase.removeChannel(leadsChannel);
      authSubscription?.unsubscribe();
    };
  }, [navigate]);

  const handleSignOut = async () => {
    // ... (função handleSignOut - sem alterações)
    try {
      const { error } = await supabase.auth.signOut();
      if (error) { toast({ title: "Sign Out Failed", description: error.message, variant: "destructive" }); }
      else { toast({ title: "Signed Out", description: "You have been successfully signed out." }); navigate('/login'); }
    } catch (error) { toast({ title: "Sign Out Failed", description: "An unexpected error occurred.", variant: "destructive" }); }
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
      {/* ... (todo o resto do código JSX continua o mesmo) ... */}
      <div className="max-w-7xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <Button onClick={handleSignOut} variant="outline">Sign Out</Button>
        </div>
        <Card className="mb-6">
          <CardHeader><CardTitle>Welcome back!</CardTitle></CardHeader>
          <CardContent><p className="text-gray-600 mb-2">You are logged in as: <strong>{user?.email}</strong></p></CardContent>
        </Card>
        <Tabs defaultValue="active-auctions" className="w-full">
          <TabsList className="grid w-full grid-cols-1 lg:w-[400px]">
            <TabsTrigger value="active-auctions">Active Auctions</TabsTrigger>
          </TabsList>
          <TabsContent value="active-auctions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {leads.map((lead) => (
                <AuctionCard key={lead.id} auction={lead} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;