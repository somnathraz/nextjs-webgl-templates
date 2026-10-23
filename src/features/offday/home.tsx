import { ProductJourney } from '@/features/offday/components/experience/product-journey';
import { Entrance } from '@/features/offday/components/experience/entrance';
import { FlavorFlight } from '@/features/offday/components/sections/flavor-flight';
import { Header } from '@/features/offday/components/sections/header';
import { Hero } from '@/features/offday/components/sections/hero';
import { Story } from '@/features/offday/components/sections/story';
import { Lifestyle } from '@/features/offday/components/sections/lifestyle';
import { Shop } from '@/features/offday/components/sections/shop';
import { Footer } from '@/features/offday/components/sections/footer';
import { ShopProvider } from '@/features/offday/components/ui/shop-provider';

export function OffdayHome() {
  return (
    <Entrance>
      <ShopProvider>
        <ProductJourney>
          <Header />
          <main id="main">
            <Hero />
            <div className="ticker" aria-label="Good energy. Great detours.">
              <div aria-hidden="true">
                GOOD ENERGY. <span>✳</span> GREAT DETOURS. <span>✳</span> GOOD
                ENERGY. <span>✳</span> GREAT DETOURS. <span>✳</span>
              </div>
            </div>
            <FlavorFlight />
            <Story />
            <Lifestyle />
            <Shop />
          </main>
          <Footer />
        </ProductJourney>
      </ShopProvider>
    </Entrance>
  );
}
