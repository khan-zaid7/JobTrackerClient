import Header from './Header';
import Footer from './Footer';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header />
      <main className="container py-4">
        {children}
      </main>
      <Footer />
    </>
  );
}
