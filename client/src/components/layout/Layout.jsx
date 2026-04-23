import { Outlet } from 'react-router-dom';
import Header from './Header.jsx';
import Footer from './Footer.jsx';
import CartSidebar from '../cart/CartSidebar.jsx';
import AnnouncementBar from './AnnouncementBar.jsx';
import MobileBottomNav from './MobileBottomNav.jsx';
import WhatsAppButton from '../ui/WhatsAppButton.jsx';

export default function Layout() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <AnnouncementBar />
      <Header />
      <main className="flex-1 pb-16 md:pb-0">
        <Outlet />
      </main>
      <Footer />
      <CartSidebar />
      <MobileBottomNav />
      <WhatsAppButton />
    </div>
  );
}
