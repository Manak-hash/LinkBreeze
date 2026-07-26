"use client";

import { Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface DuplicateThemeProps {
  activeName: string;
  onDuplicate: () => void;
  dupName: string;
  setDupName: (v: string) => void;
  dupPending: boolean;
}

export function DuplicateTheme({
  activeName,
  onDuplicate,
  dupName,
  setDupName,
  dupPending,
}: DuplicateThemeProps) {
  return (
    <Card className="mx-auto w-full max-w-2xl">
      <CardHeader>
        <CardTitle className="text-base">Duplicate theme</CardTitle>
        <CardDescription>
          Save a copy of &ldquo;{activeName}&rdquo; as a new custom theme you can edit freely.
        </CardDescription>
      </CardHeader>
      <CardContent className="flex items-center gap-2">
        <Input
          value={dupName}
          onChange={(e) => setDupName(e.target.value)}
          placeholder={`${activeName} (copy)`}
          onKeyDown={(e) => {
            if (e.key === "Enter") {
              e.preventDefault();
              onDuplicate();
            }
          }}
          maxLength={100}
        />
        <Button onClick={onDuplicate} disabled={dupPending || !dupName.trim()}>
          <Copy className="size-4" />
          {dupPending ? "Copying…" : "Duplicate"}
        </Button>
      </CardContent>
    </Card>
  );
}
