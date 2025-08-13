import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { BookOpenCheck, Timer } from "lucide-react";
import Image from "next/image";
import Link from "next/link";

export default function HomePage() {
  return (
    <div className="flex flex-col items-center justify-center">
      <header className="text-center mb-12">
        <h1 className="text-5xl font-extrabold text-primary mb-4 tracking-tight">
          Welcome to CEH Self-Paced
        </h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Your ultimate companion for acing the Certified Ethical Hacker exam. Choose your mode and start learning!
        </p>
      </header>

      <div className="w-full max-w-4xl mb-12">
        <Image 
          src="/cybersecurity-concept-collage-design-min.jpg" 
          alt="Cybersecurity concept" 
          data-ai-hint="cybersecurity ethical hacking"
          width={1200} 
          height={400} 
          className="rounded-lg shadow-xl object-cover" 
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center mb-3">
              <BookOpenCheck className="h-10 w-10 text-primary mr-4" />
              <CardTitle className="text-3xl font-semibold">Daily Practice Mode</CardTitle>
            </div>
            <CardDescription className="text-md">
              Learn at your own pace. Tackle questions sequentially, use hints, and review detailed explanations. Perfect for building a strong foundation.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
              <li>Sequential questions</li>
              <li>No time limit</li>
              <li>Hints available</li>
              <li>Detailed descriptions</li>
            </ul>
            <Button asChild className="w-full text-lg py-6" size="lg">
              <Link href="/practice">Start Practice</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="shadow-lg hover:shadow-2xl transition-shadow duration-300">
          <CardHeader>
            <div className="flex items-center mb-3">
              <Timer className="h-10 w-10 text-primary mr-4" />
              <CardTitle className="text-3xl font-semibold">Exam Simulation Mode</CardTitle>
            </div>
            <CardDescription className="text-md">
              Test your knowledge under pressure. A timed exam with random questions, just like the real CEH certification.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="list-disc list-inside space-y-1 text-muted-foreground mb-6">
              <li>125 random questions</li>
              <li>4-hour time limit</li>
              <li>Progress tracking</li>
              <li>Full-screen option</li>
            </ul>
            <Button asChild className="w-full text-lg py-6" size="lg">
              <Link href="/exam">Start Exam</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
