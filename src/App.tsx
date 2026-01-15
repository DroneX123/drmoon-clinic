import Cursor from './components/Cursor';

const AnimatedRoutes: React.FC = () => {
  const location = useLocation();

  return (
    <>
      <Cursor />
      <AnimatePresence mode="wait">
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<PageTransition><LandingPage /></PageTransition>} />
          <Route path="/booking" element={<PageTransition><BookingPage /></PageTransition>} />
          <Route path="/offers" element={<PageTransition><OffersPage /></PageTransition>} />
        </Routes>
      </AnimatePresence>
      <SpeedInsights />
    </>
  );
};

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AnimatedRoutes />
    </BrowserRouter>
  );
};

export default App;
