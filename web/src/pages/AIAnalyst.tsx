import { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { startBusinessChat } from '../lib/ai';
import { Sparkles, Send, Bot, User, Loader2, Trash2 } from 'lucide-react';
import { toast } from 'sonner';

type Message = {
  id: string;
  role: 'user' | 'model';
  text: string;
};

export default function AIAnalyst() {
  const [messages, setMessages] = useState<Message[]>([
    { id: 'welcome', role: 'model', text: "Hello! I've analyzed your latest business data. Ask me anything about your sales, inventory, or profit!" }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const chatSession = useRef<any>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    initializeChat();
  }, []);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const initializeChat = async () => {
    try {
      setInitializing(true);
      // 1. Gather Data
      const { data: sales } = await supabase.from('sales').select('*').order('created_at', { ascending: false }).limit(50);
      const { data: expenses } = await supabase.from('financial_transactions').select('*').eq('type', 'EXPENSE').limit(50);
      const { data: products } = await supabase.from('products').select('*');

      if (!sales || !expenses || !products) throw new Error('Failed to fetch data');

      // 2. Summarize
      const totalRevenue = sales.reduce((sum, s) => sum + s.total_amount, 0);
      const totalExpenses = expenses.reduce((sum, e) => sum + e.amount, 0);
      const lowStockItems = products.filter(p => p.stock <= p.min_stock).map(p => `${p.name} (${p.stock})`);
      const highValueItems = [...products].sort((a, b) => (b.stock * b.cost) - (a.stock * a.cost)).slice(0, 5).map(p => p.name);

      const context = `
        Date: ${new Date().toLocaleDateString()}
        Revenue: ₹${totalRevenue.toFixed(2)}
        Expenses: ₹${totalExpenses.toFixed(2)}
        Net Profit: ₹${(totalRevenue - totalExpenses).toFixed(2)}
        Total Sales Count: ${sales.length}
        Inventory Count: ${products.length} items
        Low Stock: ${lowStockItems.length > 0 ? lowStockItems.join(', ') : 'None'}
        Top Inventory Value: ${highValueItems.join(', ')}
      `;

      // 3. Start Chat
      chatSession.current = startBusinessChat(context);
      setInitializing(false);
    } catch (error) {
      console.error(error);
      toast.error('Failed to initialize AI context');
    }
  };

  const handleSend = async () => {
    if (!input.trim() || !chatSession.current) return;

    const userMsg: Message = { id: Date.now().toString(), role: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const result = await chatSession.current.sendMessage(userMsg.text);
      const responseText = result.response.text();
      
      const botMsg: Message = { 
        id: (Date.now() + 1).toString(), 
        role: 'model', 
        text: responseText 
      };
      setMessages(prev => [...prev, botMsg]);
    } catch (error: any) {
      toast.error('Failed to get response: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-120px)]">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
            <Sparkles className="text-indigo-600" /> AI Business Assistant
          </h1>
          <p className="text-sm text-gray-500">Ask questions about your business performance</p>
        </div>
        <button onClick={() => { setMessages([messages[0]]); initializeChat(); }} className="text-gray-400 hover:text-gray-600" title="Reset Chat">
          <Trash2 className="h-5 w-5" />
        </button>
      </div>

      <div className="flex-1 bg-white rounded-xl shadow-sm border border-gray-100 flex flex-col overflow-hidden">
        {/* Chat Area */}
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 bg-gray-50/50">
          {initializing && (
            <div className="flex justify-center p-4">
              <div className="flex items-center gap-2 text-indigo-600 text-sm">
                <Loader2 className="h-4 w-4 animate-spin" /> Analyzing latest data...
              </div>
            </div>
          )}
          
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex w-full ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`flex max-w-[80%] gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'}`}>
                <div className={`flex-shrink-0 h-8 w-8 rounded-full flex items-center justify-center ${
                  msg.role === 'user' ? 'bg-gray-200' : 'bg-indigo-100'
                }`}>
                  {msg.role === 'user' ? <User className="h-5 w-5 text-gray-600" /> : <Bot className="h-5 w-5 text-indigo-600" />}
                </div>
                
                <div className={`p-3 rounded-lg text-sm shadow-sm ${
                  msg.role === 'user' 
                    ? 'bg-indigo-600 text-white rounded-tr-none' 
                    : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none prose prose-sm max-w-none'
                }`}>
                   <div className="whitespace-pre-wrap">{msg.text}</div>
                </div>
              </div>
            </div>
          ))}
          {loading && (
             <div className="flex w-full justify-start">
               <div className="flex max-w-[80%] gap-3 flex-row">
                 <div className="flex-shrink-0 h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                   <Bot className="h-5 w-5 text-indigo-600" />
                 </div>
                 <div className="bg-white p-3 rounded-lg rounded-tl-none border border-gray-100 shadow-sm">
                   <div className="flex gap-1">
                     <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></span>
                     <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></span>
                     <span className="w-2 h-2 bg-indigo-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></span>
                   </div>
                 </div>
               </div>
             </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-white border-t">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="Ask about profit, low stock, or strategy..."
              className="w-full rounded-full border border-gray-300 pl-4 pr-12 py-3 text-sm focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 shadow-sm"
              disabled={loading || initializing}
            />
            <button
              onClick={handleSend}
              disabled={loading || initializing || !input.trim()}
              className="absolute right-2 p-2 rounded-full bg-indigo-600 text-white hover:bg-indigo-700 disabled:opacity-50 disabled:bg-gray-400 transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
          <div className="mt-2 flex justify-center gap-2">
             <button onClick={() => setInput("How can I increase my profit?")} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600 transition-colors">
               How can I increase profit?
             </button>
             <button onClick={() => setInput("What items are running low?")} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600 transition-colors">
               What items are running low?
             </button>
             <button onClick={() => setInput("Summarize my sales performance")} className="text-xs bg-gray-100 hover:bg-gray-200 px-2 py-1 rounded-full text-gray-600 transition-colors">
               Summarize sales
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}
