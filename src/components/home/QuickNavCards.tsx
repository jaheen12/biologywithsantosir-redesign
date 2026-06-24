import React from 'react';
import Link from 'next/link';
import { Microscope, Bug, Leaf, FlaskConical } from 'lucide-react';
import { Container } from '@/components/ui/Container';

interface CardItem {
  label: string;
  bangla: string;
  icon: React.ComponentType<any>;
  link: string;
}

export default function QuickNavCards() {
  const cards: CardItem[] = [
    {
      label: 'SSC Biology',
      bangla: 'মাধ্যমিক জীববিজ্ঞান',
      icon: Microscope,
      link: '/classes/ssc-biology',
    },
    {
      label: 'HSC Zoology',
      bangla: 'উচ্চ মাধ্যমিক প্রাণিবিজ্ঞান',
      icon: Bug,
      link: '/classes/hsc-zoology',
    },
    {
      label: 'HSC Botany',
      bangla: 'উচ্চ মাধ্যমিক উদ্ভিদবিজ্ঞান',
      icon: Leaf,
      link: '/classes/hsc-botany',
    },
    {
      label: 'Honours',
      bangla: 'অনার্স জীববিজ্ঞান',
      icon: FlaskConical,
      link: '/classes/honours',
    },
  ];

  return (
    <section className="w-full py-12 md:py-16 bg-surface font-ui">
      <Container>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-6">
          {cards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.label}
                href={card.link}
                className="group flex flex-col justify-center bg-primary-light border border-border rounded-xl p-4 sm:p-6 min-h-[140px] sm:min-h-[120px] transition-all duration-200 hover:border-primary hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
              >
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-3.5">
                  <div className="p-2 sm:p-2.5 rounded-lg bg-surface border border-border text-primary group-hover:bg-primary group-hover:text-white group-hover:border-primary transition-all duration-200 shrink-0">
                    <Icon className="w-5 h-5 sm:w-6 sm:h-6" />
                  </div>
                  <div className="flex flex-col">
                    <span className="text-sm sm:text-[1rem] font-bold text-text-primary group-hover:text-primary transition-colors duration-200">
                      {card.label}
                    </span>
                    <span className="text-xs sm:text-[0.8125rem] text-text-secondary">
                      {card.bangla}
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </Container>
    </section>
  );
}
