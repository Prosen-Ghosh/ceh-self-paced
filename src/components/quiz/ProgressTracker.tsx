"use client";

import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

interface ProgressTrackerProps {
  current: number;
  total: number;
}

export default function ProgressTracker({ current, total }: ProgressTrackerProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0;

  return (
    <Card className="w-full max-w-2xl shadow-md">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg">Exam Progress</CardTitle>
        <CardDescription>Question {current} of {total}</CardDescription>
      </CardHeader>
      <CardContent>
        <Progress value={percentage} className="w-full h-3" />
         <p className="text-sm text-muted-foreground mt-2 text-right">{Math.round(percentage)}% complete</p>
      </CardContent>
    </Card>
  );
}
