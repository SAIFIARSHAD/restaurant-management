import Sidebar from "../components/layout/Sidebar";
import Navbar from "../components/layout/Navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white flex">
      
      {/* Fixed Sidebar */}
      <div className="fixed inset-0 w-0 lg:w-70 z-0 h-full">
        <Sidebar />
      </div>
      
      <div className="flex-1 flex flex-col ml-64 lg:ml-68">
        
        {/* Fixed Navbar */}
        <div className="sticky top-0 z-30 bg-slate-950 border-b border-slate-800">
          <Navbar />
        </div>
        
        <main className="flex-1 px-6 py-6 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
