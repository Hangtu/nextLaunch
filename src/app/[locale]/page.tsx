import { useTranslations } from "next-intl";
import { Rocket } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ThemeToggle } from "@/components/theme-toggle";

export default function Home() {
  const t = useTranslations("home");

  return (
    <div className="bg-background relative flex h-full min-h-[70vh] items-center justify-center">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="bg-primary mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl">
            <Rocket className="text-primary-foreground h-8 w-8" />
          </div>
          <CardTitle className="text-2xl">{t("title")}</CardTitle>
          <CardDescription>{t("subtitle")}</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center">
          <Button size="lg">{t("cta")}</Button>
        </CardContent>
      </Card>
    </div>
  );
}
