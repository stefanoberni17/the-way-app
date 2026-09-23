'use client';

import { Card, Eyebrow, Button, IconBadge } from '@/components/ui';
import { HandHeart, Footprints, BookOpen, Loader2 } from 'lucide-react';

interface WeekDeepDiveProps {
  preghiera: string;
  integrazione: string;
  onOpenExtended: () => void;
  loadingExtended: boolean;
}

export default function WeekDeepDive({
  preghiera,
  integrazione,
  onOpenExtended,
  loadingExtended,
}: WeekDeepDiveProps) {
  const hasPreghiera = preghiera.trim().length > 0;
  const hasIntegrazione = integrazione.trim().length > 0;

  return (
    <div className="space-y-4 mb-6">

      {hasPreghiera && (
        <Card tone="gold">
          <div className="flex items-center gap-3 mb-4">
            <IconBadge size="sm"><HandHeart strokeWidth={1.8} /></IconBadge>
            <div>
              <Eyebrow>Preghiera della settimana</Eyebrow>
              <p className="text-xs text-muted mt-0.5">Da tenere accanto al cuore</p>
            </div>
          </div>
          <p className="font-serif italic text-[21px] leading-[1.4] text-ink whitespace-pre-line">
            {preghiera}
          </p>
        </Card>
      )}

      {hasIntegrazione && (
        <Card>
          <div className="flex items-center gap-3 mb-4">
            <IconBadge size="sm" tone="muted"><Footprints strokeWidth={1.8} /></IconBadge>
            <div>
              <Eyebrow tone="muted">Passi di integrazione</Eyebrow>
              <p className="text-xs text-muted mt-0.5">Portare il tema nella vita quotidiana</p>
            </div>
          </div>
          <p className="text-[15px] text-ink-soft leading-relaxed whitespace-pre-line">
            {integrazione}
          </p>
        </Card>
      )}

      <Button variant="secondary" full size="lg" onClick={onOpenExtended} disabled={loadingExtended}>
        {loadingExtended ? <Loader2 className="animate-spin" /> : <BookOpen strokeWidth={1.8} />}
        {loadingExtended ? 'Caricamento…' : 'Apri l’approfondimento completo'}
      </Button>

    </div>
  );
}
