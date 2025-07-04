import { useEffect, useState, useMemo } from 'react'; // Added useMemo
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from "@/components/ui/input"; // Import Input component
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/hooks/use-toast';
import type { User } from '@supabase/supabase-js';
import { AuctionCard } from '@/components/AuctionCard';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

const Dashboard = () => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeLeads, setActiveLeads] = useState<any[]>([]);
  const [purchasedLeads, setPurchasedLeads] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState(''); // New state for the search input

  const fetchData = async (userId: string) => {
    // ... (função fetchData - sem alterações)
    setIsLoading(true);
    const { data: activeData, error: activeError } = await supabase.from('leads').select('*').eq('status', 'in_auction');
    if (activeError) toast({ title: "Error fetching active auctions", description: activeError.message, variant: "destructive" });
    else if (activeData) setActiveLeads(activeData);
    const { data: purchasedData, error: purchasedError } = await supabase.from('leads').select('*').eq('assigned_to_partner_id', userId);
    if (purchasedError) toast({ title: "Error fetching your leads", description: purchasedError.message, variant: "destructive" });
    else if (purchasedData) setPurchasedLeads(purchasedData);
    setIsLoading(false);
  };

  useEffect(() => {
    // ... (useEffect principal - sem alterações)
    const checkUserSession = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) { navigate('/login'); } 
      else { setUser(session.user); fetchData(session.user.id); }
    };
    checkUserSession();
    const leadsChannel = supabase.channel('public:leads').on('postgres_changes', { event: '*', schema: 'public', table: 'leads' }, (payload) => {
      const currentUser = supabase.auth.getUser();
      currentUser.then(({ data: { user } }) => { if (user) fetchData(user.id); });
    }).subscribe();
    const { data: { subscription: authSubscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT' || !session?.user) { navigate('/login'); } 
      else { setUser(session.user); }
    });
    return () => { supabase.removeChannel(leadsChannel); authSubscription?.unsubscribe(); };
  }, [navigate]);

  const handleSignOut = async () => { /* ... (função handleSignOut - sem alterações) ... */ };

  // New logic to filter leads based on the search term
  const filteredPurchasedLeads = useMemo(() => {
    if (!searchTerm) {
      return purchasedLeads;
    }
    return purchasedLeads.filter(lead => 
      (lead.first_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.last_name?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.email?.toLowerCase() || '').includes(searchTerm.toLowerCase()) ||
      (lead.location?.toLowerCase() || '').includes(searchTerm.toLowerCase())
    );
  }, [purchasedLeads, searchTerm]);

  if (isLoading) { /* ... (bloco isLoading - sem alterações) ... */ }

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-7xl mx-auto">
        {/* ... (cabeçalho e card de boas-vindas - sem alterações) ... */}
        <div className="flex justify-between items-center mb-8"><h1 className="text-3xl font-bold">Dashboard</h1><Button onClick={handleSignOut} variant="outline">Sign Out</Button></div>
        <Card className="mb-6"><CardHeader><CardTitle>Welcome back!</CardTitle></CardHeader><CardContent><p className="text-gray-600 mb-2">You are logged in as: <strong>{user?.email}</strong></p></CardContent></Card>

        <Tabs defaultValue="active-auctions" className="w-full">
          <TabsList className="grid w-full grid-cols-2 lg:w-[400px]">
            <TabsTrigger value="active-auctions">Active Auctions</TabsTrigger>
            <TabsTrigger value="my-leads">My Leads</TabsTrigger>
          </TabsList>
          
          <TabsContent value="active-auctions">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mt-6">
              {activeLeads.map((lead) => (<AuctionCard key={lead.id} auction={lead} />))}
            </div>
          </TabsContent>

          {/* --- CONTEÚDO DA ABA "MY LEADS" ATUALIZADO --- */}
          <TabsContent value="my-leads">
            <Card className="mt-6">
              <CardHeader>
                <CardTitle>My Purchased Leads</CardTitle>
                <div className="mt-4">
                  <Input 
                    placeholder="Search by name, email, location..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="max-w-sm"
                  />
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Full Name</TableHead>
                      <TableHead>Phone</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Interest Type</TableHead>
                      <TableHead>Purchase Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPurchasedLeads.map((lead) => (
                      <TableRow key={lead.id}>
                        <TableCell>{`${lead.first_name || ''} ${lead.last_name || ''}`}</TableCell>
                        <TableCell>{lead.phone}</TableCell>
                        <TableCell>{lead.email}</TableCell>
                        <TableCell>{lead.interest_type}</TableCell>
                        <TableCell>
                          {lead.purchased_at ? new Date(lead.purchased_at).toLocaleDateString('en-AU') : 'N/A'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Dashboard;