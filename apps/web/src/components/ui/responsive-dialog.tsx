/**
 * Patrón mobile-first clave: el mismo contenido se muestra como Dialog centrado
 * en desktop y como Drawer (hoja inferior, alcanzable con el pulgar) en mobile.
 * Usar SIEMPRE este componente en lugar de Dialog directo.
 */
import { Dialog as DialogPrimitive } from "radix-ui";
import type { ReactNode } from "react";
import { Drawer } from "vaul";
import { useIsDesktop } from "@/hooks/use-media-query";

type Props = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description?: string;
  children: ReactNode;
};

export function ResponsiveDialog({ open, onOpenChange, title, description, children }: Props) {
  const isDesktop = useIsDesktop();

  if (isDesktop) {
    return (
      <DialogPrimitive.Root open={open} onOpenChange={onOpenChange}>
        <DialogPrimitive.Portal>
          <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50" />
          <DialogPrimitive.Content className="fixed top-1/2 left-1/2 z-50 grid w-full max-w-lg -translate-x-1/2 -translate-y-1/2 gap-4 rounded-xl border bg-background p-6 shadow-lg">
            <div className="grid gap-1.5">
              <DialogPrimitive.Title className="text-lg font-semibold">
                {title}
              </DialogPrimitive.Title>
              {description && (
                <DialogPrimitive.Description className="text-sm text-muted-foreground">
                  {description}
                </DialogPrimitive.Description>
              )}
            </div>
            {children}
          </DialogPrimitive.Content>
        </DialogPrimitive.Portal>
      </DialogPrimitive.Root>
    );
  }

  return (
    <Drawer.Root open={open} onOpenChange={onOpenChange}>
      <Drawer.Portal>
        <Drawer.Overlay className="fixed inset-0 z-50 bg-black/50" />
        <Drawer.Content className="fixed inset-x-0 bottom-0 z-50 mt-24 flex max-h-[90dvh] flex-col rounded-t-xl border bg-background">
          <div className="mx-auto mt-3 h-1.5 w-12 shrink-0 rounded-full bg-muted" />
          <div className="grid gap-1.5 p-4">
            <Drawer.Title className="text-lg font-semibold">{title}</Drawer.Title>
            {description && (
              <Drawer.Description className="text-sm text-muted-foreground">
                {description}
              </Drawer.Description>
            )}
          </div>
          <div className="overflow-y-auto px-4 pb-safe">
            <div className="pb-4">{children}</div>
          </div>
        </Drawer.Content>
      </Drawer.Portal>
    </Drawer.Root>
  );
}
