import { Entrance } from '@/features/aura/components/experience/entrance';
import { SoundExperience } from '@/features/aura/components/sections/sound-experience';
import { Header } from '@/features/aura/components/sections/header';
import { Hero } from '@/features/aura/components/sections/hero';
import { DesignStory } from '@/features/aura/components/sections/design-story';
import { Details } from '@/features/aura/components/sections/details';
import { Configurator } from '@/features/aura/components/sections/configurator';
import { Footer } from '@/features/aura/components/sections/footer';

export function AuraHome() {
  return (
    <Entrance>
      <Header />
      <main id="main">
        <Hero />
        <DesignStory />
        <SoundExperience />
        <Details />
        <Configurator />
      </main>
      <Footer />
    </Entrance>
  );
}
