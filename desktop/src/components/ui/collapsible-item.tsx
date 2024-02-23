"use client";

import { DotsVerticalIcon } from "@radix-ui/react-icons";
import * as React from "react";

import { Button } from "@/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface IProps {
  title?: string;
  triggerText: string;
  children: React.ReactNode;
  defaultOpen: boolean;
}

export function CollapsibleItem(props: IProps) {
  const { title, triggerText, children, defaultOpen } = props;
  const [isOpen, setIsOpen] = React.useState(defaultOpen);

  React.useEffect(() => {
    setIsOpen(defaultOpen);
  }, [defaultOpen]);

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="space-y-2" //w-[350px]
    >
      <div className="flex items-center justify-stretch  my-1">
        {title && <div className="text-sm font-semibold">{title}</div>}

        <CollapsibleTrigger asChild>
          <Button variant="ghost" size="sm">
            <DotsVerticalIcon className="h-4 w-4 mr-1" />
            {triggerText}
            <span className="sr-only">Toggle Open</span>
          </Button>
        </CollapsibleTrigger>
      </div>

      <CollapsibleContent className="space-y-2">
        <div className="rounded-md border px-4 py-2 font-mono text-sm shadow-sm">
          {children}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}