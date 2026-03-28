import React from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'

type NoContentProps = {
    title?: string;
    message?: string;
}

export default function NoContent({
    title = "Nothing To Show",
    message = "There is no content available for this section yet.",
}: NoContentProps) {
    return (
        <Card className="rounded-2xl border-dashed border-border/70 bg-background/60 shadow-none">
            <CardHeader>
                <CardTitle className="text-xl">{title}</CardTitle>
                <CardDescription>{message}</CardDescription>
            </CardHeader>
            <CardContent>
                <div className="rounded-xl border border-dashed border-border/60 bg-muted/30 px-4 py-6 text-sm text-muted-foreground">
                    Check another tab or come back later for more related content.
                </div>
            </CardContent>
        </Card>
    )
}
