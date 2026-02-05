'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Autoplay } from 'swiper/modules';
import 'swiper/css';

import { Listing } from '@/types';
import ListingCard from './ListingCard';

export default function FeaturedSlider({ listings }: { listings: Listing[] }) {
  return (
    <Swiper
      modules={[Autoplay]}
      spaceBetween={20}
      slidesPerView={1.2}
      breakpoints={{
        640: { slidesPerView: 2.2 },
        1024: { slidesPerView: 4 },
      }}
      autoplay={{ delay: 3000 }}
    >
      {listings.map((listing) => (
        <SwiperSlide key={listing.id}>
          <ListingCard listing={listing} />
        </SwiperSlide>
      ))}
    </Swiper>
  );
}
